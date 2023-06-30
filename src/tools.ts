import { convert } from 'html-to-text'
import { XMLParser } from 'fast-xml-parser'
import { removeStopwords } from 'stopword'
import natural from 'natural'
import {
  Feed,
  CorsProxy
} from './db-fixture'

const parser = new XMLParser();

export const cleanNostrPost = (post) => {
  const tokenizer = new natural.WordTokenizer
  return {
    mlText: tokenizer.tokenize(
      convert(
        post.content,
        {
          ignoreLinks: true,
          ignoreHref: true,
          ignoreImage: true,
          linkBrackets: false
        }
      ))
      .filter(word => word.length < 24)
      .join(' ')
      .toLowerCase()
    ,...post
  }
}

const parseRSS = (content) => {
  const feedTitle = content.rss.channel.title
  const feedLink = content.rss.channel.link
  const feedDescription = content.rss.channel.description
  const feedPosts = content.rss.channel.item.length == null ?
    [content.rss.channel.item] :
    content.rss.channel.item

  return [...feedPosts]
    .map((itemEntry) => ({
      feedTitle: feedTitle,
      feedLink: feedLink,
      feedDescription: feedDescription,
      ...itemEntry
    }))
    .map(itemEntry => ({
      postSummary: convert(
        itemEntry.description,
        {
          ignoreLinks: true,
          ignoreHref: true,
          ignoreImage: true,
          linkBrackets: false
        })
      .replace(/\[.*?\]/g, '')
      .replace(/\n/g,' ')
      .toString()
      .trim(),
      ...itemEntry
    }))
    .map(itemEntry => ({
      ...itemEntry,
      postId: itemEntry.link || itemEntry.guid,
      postTitle: itemEntry.title,
      mlText: removeStopwords(`${itemEntry.title} ${itemEntry.postSummary}`
        .replace('undefined','')
        .replace(/[^\p{L}\s]/gu,"")
        .split(' '))
        .join(' ')
        .toLowerCase()
    })
  )
}

const parseAtom = (content) => {

  const feedTitle = content.feed?.feedTitle
  const feedLink = content.feed?.id
  const feedDescription = content.feed?.subtitle
  const feedPosts = content.feed?.entry

  return feedPosts?.map((itemEntry) => ({
      feedTitle: feedTitle,
      feedLink: feedLink,
      feedDescription: feedDescription,
      ...itemEntry[0]
    }))
    .map(itemEntry => ({
      postSummary: convert(itemEntry.content, { ignoreLinks: true, ignoreHref: true, ignoreImage: true, linkBrackets: false  })
      .replace(/\[.*?\]/g, '')
      .replace(/\n/g,' ')
      .toString()
      .trim(),
      ...itemEntry
    }))
    .map(itemEntry => ({
      ...itemEntry,
      postId: itemEntry.id,
      postTitle: itemEntry.title,
      mlText: removeStopwords(`${itemEntry.title} ${itemEntry.postSummary}`
        .replace('undefined','')
        .replace(/[^\p{L}\s]/gu,"")
        .split(' '))
        .join(' ')
        .toLowerCase()
    })
  )
}
export const parsePosts = (postsXML) => {
  const parseQueue = []
  postsXML.forEach(postsXML => {
    parseQueue.push(new Promise(resolve => {
      const content = parser.parse(postsXML)
      const parsed = content.rss ? parseRSS(content) : parseAtom(content)
      resolve(parsed)
    }))
  })
  return Promise.all(parseQueue)
}

export const appendPrediction = ((posts, classifierJSON, thresholdPromoteDocCount, thresholdSuppressDocCount)  => {
  return new Promise(resolve => {
    const predictQueue = []
    posts.forEach(post => {
      predictQueue.push(new Promise((resolve) => {
        var freshNewClassifier = new natural.BayesClassifier()
        freshNewClassifier.addDocument('free beer','promote')
        freshNewClassifier.addDocument('craig wright','suppress')
        freshNewClassifier.train()
        var classifier = (`${classifierJSON}` != '' ?
          natural.BayesClassifier.restore(JSON.parse(classifierJSON)) :
          freshNewClassifier
        )
        const postWithPrediction = post
        const prediction = classifier.getClassifications(post.mlText)
        postWithPrediction.prediction = prediction
        postWithPrediction.thresholdPromoteDocCount = thresholdPromoteDocCount
        postWithPrediction.thresholdSuppressDocCount = thresholdSuppressDocCount
        resolve(postWithPrediction)
      }))
    })
    Promise.all(predictQueue)
    .then(predictions => resolve(predictions))
  })
})

export const fetchPosts = ((feeds, processedPosts, corsProxies) => {
  return new Promise((resolve) => {
    const fetchQueue: any[] = []
    feeds.forEach((feed: Feed) => {
      fetchQueue.push(new Promise((resolve) => {
        corsProxies.slice().forEach((corsProxy: CorsProxy) => {
          fetch(`${corsProxy.id}${feed.id}`).then(response => {
            response.text().then(feedText => {
              resolve(feedText)
            })
          })
        })
      }))
    })
    Promise.all(fetchQueue).then(fetchedPosts => {
      parsePosts(fetchedPosts)
      .then(parsed => {
        const cleanPosts = parsed.flat()
        .filter(post => {
          return post?.mlText != " "
        })
        .map(post => {
          return {
            ...post,
            postTitle: post?.postTitle
            .replace(/&#039;/g, "'")
            .replace(/&#8217;/g, "'")
            .replace(/&#8211;/g, "-")
            .replace(/&#8216;/g, "'")
            .replace(/&#038;/g, "&")
          }
        })
       .filter((postItem) => {
          const processedPostsID = shortUrl(postItem.feedLink == "" ? postItem.guid : postItem.feedLink)
          const processedPostsForFeedLink = processedPosts.slice()
          .find((processedPostEntry: any) => processedPostEntry.id === processedPostsID)?.processedPosts.slice()
          if (processedPostsForFeedLink == undefined) {
            return true
          }
          return processedPostsForFeedLink.indexOf(postItem.mlText) == -1
        })
        resolve(cleanPosts)
      })
    })
  })
})

const removePunctuation = (text: string) => {
  return `${text}`
    .replace(/[/?…".,#!$%^&*;:{}=_`~()'’‘“”]/g, '')
    .replace(/\s{2,}/g, ' ');
};

export const shortUrl = (text: string) => {
  const theUrl = new URL(text);
  const newPath = removePunctuation(`${theUrl.hostname}${theUrl.pathname}`)
    .replace(/-/g, '')
    .toLowerCase();
  return newPath;
};

export const nHoursAgo = (hrs: number): number =>
  Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);