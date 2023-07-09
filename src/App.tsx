import { convert } from 'html-to-text'
import WinkClassifier from 'wink-naive-bayes-text-classifier';
import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import {
  Suspense,
  createEffect,
  createSignal,
  Signal,
  Component
} from 'solid-js';
import {
  Routes,
  Route
} from '@solidjs/router';
import {
  DbFixture,
  NostrRelay,
  Category,
  Feed,
  CorsProxy,
  Classifier,
  ProcessedPost
} from "./db-fixture";
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser'
import { createDexieArrayQuery } from "solid-dexie";
import { eventKind, NostrFetcher } from "nostr-fetch";
import { Link } from "@kobalte/core";
import Posts from './Posts'
import NostrPosts from './NostrPosts'
import NavBar from './NavBar';
import Main from './Main';
import NostrKeys from './NostrKeys';
import Feeds from './Feeds';
import CorsProxies from './CorsProxies';
import NostrRelays from './NostrRelays';
import Categories from './Categories';
import Classifiers from './Classifiers';
import Heading from './Heading';

import Contribute from './Contribute';
import defaultNostrKeys from './defaultNostrKeys';
import defaultNostrRelays from './defaultNostrRelays';
import defaultFeeds from './defaultFeeds';
import defaultCorsProxies from './defaultCorsProxies';
import defaultCategories from './defaultCategories';
import defaultClassifiers from './defaultClassifiers';
import defaultProcessed from './defaultProcessed';
import { NostrKey } from './db-fixture'

const navBarWidth = 250
const fetcher = NostrFetcher.init();
const db = new DbFixture();
const parser = new XMLParser();

const nlp = winkNLP( model );
const its = nlp.its;

db.on("populate", () => {
  db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  db.feeds.bulkAdd(defaultFeeds as Feed[]);
  db.corsproxies.bulkAdd(defaultCorsProxies as CorsProxy[]);
  db.categories.bulkAdd(defaultCategories as Category[]);
  db.classifiers.bulkAdd(defaultClassifiers as Classifier[]);
  db.processedposts.bulkAdd(defaultProcessed as ProcessedPost[]);
});

function createStoredSignal<T>(
  key: string,
  defaultValue: T,
  storage = localStorage
): Signal<T> {
  const initialValue = storage.getItem(key) && storage.getItem(key) != null
    ? JSON.parse(`${storage.getItem(key)}`) as T
    : defaultValue;
  const [value, setValue] = createSignal<T>(initialValue);
  const setValueAndStore = ((arg) => {
    const v = setValue(arg);
    storage.setItem(key, JSON.stringify(v));
    return v;
  }) as typeof setValue;
  return [value, setValueAndStore];
}

const prepTask = function ( text: string ) {
  const tokens: string[] = [];
  nlp.readDoc(text)
      .tokens()
      // Use only words ignoring punctuations etc and from them remove stop words
      .filter( (t: any) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
      // Handle negation and extract stem of the word
      .each( (t: any) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );
  return tokens;
};

const parseRSS = (content:any) => {
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
      .replace(/\n/g,' ')?.toString()
      .trim(),
      ...itemEntry
    }))
    .map(itemEntry => ({
      ...itemEntry,
      postId: itemEntry.link || itemEntry.guid,
      postTitle: itemEntry.title,
      mlText: prepTask(convert(`${itemEntry.title} ${itemEntry.postSummary}`))
        .filter((word) => word.length < 30)
        .join(' ')
        .toLowerCase()
    })
  )
}
const parseAtom = (content: any) => {
  const feedTitle = content.feed?.feedTitle
  const feedLink = content.feed?.id
  const feedDescription = content.feed?.subtitle
  const feedPosts = content.feed?.entry
  return feedPosts?.map((itemEntry: any) => ({
      feedTitle: feedTitle,
      feedLink: feedLink,
      feedDescription: feedDescription,
      ...itemEntry[0]
    }))
    .map((itemEntry: any) => ({
      postSummary: convert(itemEntry.content, { ignoreLinks: true, ignoreHref: true, ignoreImage: true, linkBrackets: false  })
      .replace(/\[.*?\]/g, '')
      .replace(/\n/g,' ')?.toString()
      .trim(),
      ...itemEntry
    }))
    .map((itemEntry: any) => ({
      ...itemEntry,
      postId: itemEntry?.id,
      postTitle: `${itemEntry.title}`,
      mlText: prepTask(convert(`${itemEntry.title} ${itemEntry.postSummary}`))
        .filter((word) => word.length < 30)
        .join(' ')
        .toLowerCase()
    })
  )
}
const parsePosts = (postsXML: any[]) => {
  const parseQueue: any[] = []
  postsXML.forEach(xmlEntry => {
    parseQueue.push(new Promise(resolve => {
      const content = parser.parse(xmlEntry.data)
      const parsed = content.rss ? parseRSS(content) : parseAtom(content)
      resolve(parsed)
    }))
  })
  return Promise.all(parseQueue)
}

const removePunctuation = (text: string) => {
  return `${text}`
    .replace(/[/?…".,#!$%^&*;:{}=_`~()'’‘“”]/g, '')
    .replace(/\s{2,}/g, ' ');
};

const shortUrl = (text: string) => {
  const theUrl = new URL(text);
  const newPath = removePunctuation(`${theUrl.hostname}${theUrl.pathname}`)
    .replace(/-/g, '')
    .toLowerCase();
  return newPath;
};


const App: Component = () => {

  const categories = createDexieArrayQuery(() => db.categories.toArray());
  const nostrKeys = createDexieArrayQuery(() => db.nostrkeys.toArray());
  const ignoreNostrKeys = createDexieArrayQuery(() => db.nostrkeys
  .filter(nostrKey => nostrKey.ignore === true)
  .toArray()
  );
  const putNostrKey = async (newKey: NostrKey) => {
    await db.nostrkeys.put(newKey)
  }
  const removeNostrKey = async (nostrKeyRemove: NostrKey) => {
    await db.nostrkeys.where('publicKey').equals(nostrKeyRemove.publicKey).delete()
  }
  const [selectedCategory, setSelectedCategory] = createStoredSignal('selectedCategory', '')

  const classifiers = createDexieArrayQuery(() => db.classifiers.toArray());

  const putNostrRelay = async (newNostrRelay: NostrRelay) => {
    await db.nostrrelays.put(newNostrRelay)
  }
  const removeNostrRelay = async (nostrRelayToRemove: NostrRelay) => {
    await db.nostrrelays.where('id').equals(nostrRelayToRemove?.id).delete()
  }

  const feeds = createDexieArrayQuery(() => db.feeds.toArray());

  const checkedFeeds = createDexieArrayQuery(() => db.feeds
    .filter(feed => feed.checked === true)
    .toArray());

  const putFeed = async (newFeed: Feed) => {
    await newFeed?.id && db.feeds.put(newFeed)
  }

  const removeFeed = async (feedRemove: Feed) => {
    await db.feeds.where('id').equals(feedRemove?.id).delete()
  }

  const corsProxies = createDexieArrayQuery(() => db.corsproxies.toArray());

  const putCorsProxy = async (newCorsProxy: CorsProxy) => {
    await db.corsproxies.put(newCorsProxy)
  }
  const removeCorsProxy = async (corsProxyToRemove: CorsProxy) => {
    await db.corsproxies.where('id').equals(corsProxyToRemove?.id).delete()
  }

  const processedPosts = createDexieArrayQuery(() => db.processedposts.toArray());

  const putProcessedPost = async (newProcessedPost: ProcessedPost) => {
    await db.processedposts.put(newProcessedPost)
  }

  const putCategory = async (newCategory: Category) => {
    await db.categories.put(newCategory)
  }

  const removeCategory = async (categoryToRemove: Category) => {
    await db.categories.where('id').equals(categoryToRemove?.id).delete()
  }
  const cleanNostrPost = (post: any) => {
    return {
      mlText: prepTask(convert(
          `${post.content}`.replace(/\d+/g, ''),
          {
            ignoreLinks: true,
            ignoreHref: true,
            ignoreImage: true,
            linkBrackets: false
          }
        ))
        .filter((word) => word.length < 30)
        .join(' ')
        .toLowerCase() || '',
      ...post
    }
  }

  const applyPrediction = (post: any, category: string) => {
    const classifierEntry = classifiers.find((classifierEntry) => classifierEntry?.id == category)
    if (classifierEntry == undefined || `${classifierEntry?.model}` == '') {
      return post
    }
    let winkClassifier = WinkClassifier()
    const prepTask = function ( text: string ) {
      const tokens: string[] = [];
      nlp.readDoc(text)
        .tokens()
        // Use only words ignoring punctuations etc and from them remove stop words
        .filter( (t: any) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
        // Handle negation and extract stem of the word
        .each( (t: any) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );
      return tokens;
    };
    winkClassifier.definePrepTasks( [ prepTask ] );
    winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
    winkClassifier.importJSON(classifierEntry.model)
    try {
      const docCount = Object.values(winkClassifier.stats().labelWiseSamples).reduce((val, runningTotal: any) => val as number + runningTotal)
      if (docCount > 2) {
        winkClassifier.consolidate()
      }
      const prediction = winkClassifier.computeOdds(post?.mlText)
      const postWithPrediction = {
        ...post,
        ...{
          'prediction': prediction,
          'docCount': docCount
        }
      }
      return postWithPrediction
    } catch (error) {
      if (error != null) {
        return post
      }
    }
  }

  const putClassifier = async (newClassifierEntry: Classifier) => {
    if (newClassifierEntry.model === '') {
      return
    }
    if (newClassifierEntry?.id === undefined) {
      return
    }

    let oldClassifier = await db.classifiers.get(newClassifierEntry?.id)

    if (newClassifierEntry.model == oldClassifier?.model) {
      return
    }
    await db.classifiers.put(newClassifierEntry)
  }

  const removeClassifier = async (classifierToRemove: Classifier) => {
    await db.classifiers.where('id').equals(classifierToRemove?.id).delete()
  }

  const [posts, setPosts] = createSignal<object[]>([])
  const [nostrPosts, setNostrPosts] = createSignal<object[]>([])
  const [isOpen, setIsOpen] = createStoredSignal('isSideNavOpen', false)
  const [selectedNostrAuthor, setSelectedNostrAuthor] = createStoredSignal('selectedNostrAuthor', '')
  const nostrRelays = createDexieArrayQuery(() => db.nostrrelays.toArray());
  const checkedNostrRelays = createDexieArrayQuery(() => db.nostrrelays
    .filter(feed => feed.checked === true)
    .toArray());

  createEffect(() => {
    const feedsForCategory = checkedFeeds
      .filter((feed) => selectedCategory() === '' || feed.categories.indexOf(selectedCategory()) !== -1)
    const fetchQueue: any[] = []
    feedsForCategory.forEach((feed: Feed) => {
      fetchQueue.push(new Promise((resolve) => {
        try {
          corsProxies?.slice().forEach((corsProxy) => {
            axios.get(`${corsProxy.id}${feed.id}`)
            .then(response => {
              resolve(response)
            })
          })
        } catch (error) {
          resolve('')
        }
      }))
    })

    Promise.all(fetchQueue)
    .then(fetchedPosts => parsePosts(fetchedPosts))
    .then((parsed: any[]) => {
      const cleanPosts = parsed.flat()
      .filter(post => `${post?.mlText}`.trim() != '')
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
      .filter((postItem: any) => {
        const processedPostsID = postItem.feedLink === "" ? postItem.guid : shortUrl(postItem.feedLink)
        const processedPostsForFeedLink = processedPosts.slice()
        .find((processedPostEntry: any) => processedPostEntry?.id === processedPostsID)?.processedPosts.slice()
        if (processedPostsForFeedLink == undefined) {
          return true
        }
        return processedPostsForFeedLink.indexOf(postItem?.mlText) == -1
      })
      .map((post) => applyPrediction(post, selectedCategory()))
      setPosts(cleanPosts)
    })
  })


  createEffect(() => {
    const selectedNostrAuthorToFetch = selectedNostrAuthor()?.toString()
    const filterOptions = selectedNostrAuthorToFetch ?
    {
      kinds: [ eventKind.text ],
      authors: [selectedNostrAuthorToFetch],
    } :
    {
      kinds: [ eventKind.text ]
    }

    if ([...checkedNostrRelays].length < 1 ) {
      return
    }
    fetcher.fetchLatestEvents(
      [...checkedNostrRelays.map((nostrRelay) => nostrRelay['id'])],
      filterOptions,
      selectedNostrAuthorToFetch ? 100 : 500,
    ).then((allPosts) => {
      const cleanedNostrPosts = allPosts
      .filter(nostrPost => !ignoreNostrKeys.find(ignoreKey => ignoreKey.publicKey == nostrPost.pubkey))
      .map(nostrPost => cleanNostrPost(nostrPost))
      .map(post => applyPrediction(post, 'nostr'))
      setNostrPosts(cleanedNostrPosts)
    })
  })

  return (
    <div>
      <div class='openbtn'>
        <Link.Root
            onClick={event => {
              event.preventDefault()
              setIsOpen(true)
            }}
        >
          ⭢
        </Link.Root>
      </div>
      <NavBar
        navBarWidth={navBarWidth}
        handleClose={() => setIsOpen(false)}
        isOpen={isOpen}
        categories={categories.filter(category => category.checked)}
        setSelectedCategory={setSelectedCategory}
      />
      <Routes>
        <Route element={
            <Main
              navBarWidth={navBarWidth}
              isOpen={isOpen}
            >
              <NostrKeys
                nostrKeys={nostrKeys}
                putNostrKey={putNostrKey}
                removeNostrKey={removeNostrKey}
              />
            </Main>
          } path='/nostr'
          />
        <Route element={<Main navBarWidth={navBarWidth} isOpen={isOpen}><div><Contribute /></div></Main>} path='/contribute' />
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
            <Feeds
              feeds={feeds}
              putFeed={putFeed}
              removeFeed={removeFeed}
              categories={categories}
            />
          </Main>
        } path='/feeds'
        />
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
              <CorsProxies
              corsProxies={corsProxies}
              putCorsProxy={putCorsProxy}
              removeCorsProxy={removeCorsProxy}
             />
            </Main>
        } path='/cors'
        />
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
              <NostrRelays
              nostrRelays={nostrRelays}
              putNostrRelay={putNostrRelay}
              removeNostrRelay={removeNostrRelay}
             />
            </Main>
        } path='/nostrrelays'
        />
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
            <Categories
              categories={categories}
              putCategory={putCategory}
              removeCategory={removeCategory}
            />
          </Main>
        } path='/categories'
        />
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
            <Classifiers
              classifiers={classifiers}
              putClassifier={putClassifier}
              removeClassifier={removeClassifier}
            />
          </Main>
        } path='/classifiers'
        />
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
            <NostrPosts
              setSelectedNostrAuthor={setSelectedNostrAuthor}
              selectedNostrAuthor={selectedNostrAuthor()}
              setNostrPosts={setNostrPosts}
              nostrPosts={nostrPosts()}
              classifiers={classifiers}
              putClassifier={putClassifier}
              processedPosts={processedPosts}
              putProcessedPost={putProcessedPost}
              putNostrKey={putNostrKey}
              category={selectedCategory()}
              applyPrediction={applyPrediction}
            />
          </Main>
        } path='/nostrposts'
        />

        <Route
          element={
            <Main
              navBarWidth={navBarWidth}
              isOpen={isOpen}
            >
            <Suspense
              fallback={
                <div class='fade-in'>
                  <Heading>
                    <div>{selectedCategory()}</div>
                  </Heading>
                  <div>fetching posts</div>
                </div>
              }
            >
              <Posts
                category={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                posts={posts}
                classifiers={classifiers}
                putClassifier={putClassifier}
                processedPosts={processedPosts}
                putProcessedPost={putProcessedPost}
                applyPrediction={applyPrediction}
               />
            </Suspense>
            </Main>
          }
          path={[
            '/',
            '/posts',
            '/posts/:category'
          ]}
        />
      </Routes>

    </div>
  );
};

export default App;
