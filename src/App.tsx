import { convert } from 'html-to-text'
import {nip19} from 'nostr-tools'

import {
  createSignal,
  createEffect,
  Signal,
  createResource,
  Suspense
} from 'solid-js';
import {
  Routes,
  Route
} from '@solidjs/router';
import Main from './Main';
import NostrPosts from './NostrPosts';
import NavBar from './NavBar';
import { Link } from "@kobalte/core";
import {
  NostrFetcher
  , eventKind
} from "nostr-fetch";

const fetcher = NostrFetcher.init();

const navBarWidth = 250

import WinkClassifier from 'wink-naive-bayes-text-classifier';
import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import {
  DbFixture,
  NostrRelay,
  NostrKey,
  TrainLabel,
  Feed,
  CorsProxy,
  Classifier,
  ProcessedPost
} from "./db-fixture";
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser'
import { createDexieArrayQuery } from "solid-dexie";
import Posts, {shortUrl} from './Posts'
import NostrKeys from './NostrKeys';
import Feeds from './Feeds';
import CorsProxies from './CorsProxies';
import NostrRelays from './NostrRelays';
import TrainLabels from './TrainLabels';
import Classifiers from './Classifiers';
import Heading from './Heading';
import AlbySignIn from './AlbySignIn'
import Contribute from './Contribute';
import Subscribers from './Subscribers';
import defaultNostrKeys from './defaultNostrKeys';
import defaultNostrRelays from './defaultNostrRelays';
import defaultFeeds from './defaultFeeds';
import defaultCorsProxies from './defaultCorsProxies';
import defaultTrainLabels from './defaultTrainLabels';
import defaultClassifiers from './defaultClassifiers';
import defaultProcessed from './defaultProcessed';

const db = new DbFixture();
const parser = new XMLParser();
const nlp = winkNLP( model );
const its = nlp.its;

db.on("populate", () => {
  db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  db.feeds.bulkAdd(defaultFeeds as Feed[]);
  db.corsproxies.bulkAdd(defaultCorsProxies as CorsProxy[]);
  db.trainlabels.bulkAdd(defaultTrainLabels as TrainLabel[]);
  db.classifiers.bulkAdd(defaultClassifiers as Classifier[]);
  db.processedposts.bulkAdd(defaultProcessed as ProcessedPost[]);
});

function createStoredSignal<T>(
  key: string,
  defaultValue: T,
  storage = localStorage
): Signal<T> {
  const initialValue = storage.getItem(key) != undefined
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

const prepNostrPost = (post: any) => {
  return {
    mlText: prepTask(convert(
      `${post.content}`
      .replace(/\d+/g, '')
      .replace(/#/g, ''),
      {
        ignoreLinks: true,
        ignoreHref: true,
        ignoreImage: true,
        linkBrackets: false
      }
    )
    )
    .filter((word: string) => word.length < 30)
    .filter((word: string) => word!='nostr')
    .filter((word: string) => word!='vmess')
    .join(' ')
    .toLowerCase() || '',
    ...post
  }
}

const applyPrediction = (params: {
  post: any,
  classifier: any
}) => {
  try {
    const docCount: number = params.classifier.stats().labelWiseSamples ? Object.values(params.classifier.stats().labelWiseSamples).reduce((val, runningTotal: any) => val as number + runningTotal, 0) as number : 0
    if (docCount > 2) {
      params.classifier.consolidate()
    }
    const prediction = Object.fromEntries(params.classifier.computeOdds(params.post?.mlText))
    const postWithPrediction = {
      ...params.post,
      ...{
        'prediction': prediction,
        'docCount': docCount
      }
    }
    return postWithPrediction
  } catch (error) {
    if (error != null) {
      const newPost = params.post
      newPost.prediction = params.classifier.stats()
      return newPost
    }
  }
}

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
      try {
        const content = parser.parse(xmlEntry.data)
        const parsed = content.rss ? parseRSS(content) : parseAtom(content)
        resolve(parsed)
      } catch (error) {
        console.log(error)
        resolve([])
      }
    }))
  })
  return Promise.all(parseQueue)
}

const App = () => {
  const [isOpen, setIsOpen] = createStoredSignal('isNavbarOpen', false);
  const trainLabels = createDexieArrayQuery(() => db.trainlabels.toArray());
  const nostrRelays = createDexieArrayQuery(() => db.nostrrelays.toArray());
  const checkedNostrRelays = createDexieArrayQuery(() => db.nostrrelays
    .filter(relay => relay.checked === true)
    .toArray()
    );
  const [selectedTrainLabel, setSelectedTrainLabel] = createStoredSignal('selectedTrainLabel', '')
  const [selectedNostrAuthor, setSelectedNostrAuthor] = createStoredSignal('selectedNostrAuthor', '')
  const [albyTokenReadInvoice, setAlbyTokenReadInvoice] = createStoredSignal('albyTokenReadInvoice', '')
  const [albyCodeVerifier, setAlbyCodeVerifier] = createStoredSignal('albyCodeVerifier', '')
  const [albyCode, setAlbyCode] = createStoredSignal('albyCode', '')
  const [nostrQuery, setNostrQuery] = createSignal('')

  const [fetchRssParams, setFetchRssParams] = createSignal('')

  const ignoreNostrKeys = createDexieArrayQuery(() => db.nostrkeys
  .filter(nostrKey => nostrKey.ignore === true)
  .toArray()
  );

  createEffect(() => {
    const nostrRelayList = checkedNostrRelays
      .map((relay: NostrRelay) => relay.id)
    const nostrAuthor = selectedNostrAuthor()
    const newQuery = JSON.stringify({
      'nostrRelayList': nostrRelayList,
      'nostrAuthor': nostrAuthor,
      'ignore': ignoreNostrKeys,
    })
    setNostrQuery(newQuery)
  })
  const [nostrPosts] = createResource(nostrQuery, fetchNostrPosts);
  const [albyIncomingInvoices] = createResource(albyTokenReadInvoice, fetchAlbyInvoices)

  const [rssPosts] = createResource(fetchRssParams, fetchRssPosts);
  const putNostrRelay = async (newNostrRelay: NostrRelay) => {
    await db.nostrrelays.put(newNostrRelay)
  };
  const removeNostrRelay = async (nostrRelayToRemove: NostrRelay) => {
    await db.nostrrelays.where('id').equals(nostrRelayToRemove?.id).delete()
  };
  const nostrKeys = createDexieArrayQuery(() => db.nostrkeys.toArray());
  const putNostrKey = async (newKey: NostrKey) => {
    await db.nostrkeys.put(newKey)
  }
  const removeNostrKey = async (nostrKeyRemove: NostrKey) => {
    await db.nostrkeys.where('publicKey').equals(nostrKeyRemove.publicKey).delete()
  }

  const classifiers = createDexieArrayQuery(() => db.classifiers.toArray());
  const feeds = createDexieArrayQuery(() => db.feeds.toArray());

  const checkedFeeds = createDexieArrayQuery(() => db.feeds
    .filter(feed => feed.checked === true)
    .toArray());

  const checkedCorsProxies = createDexieArrayQuery(() => db.corsproxies
    .filter(corsProxy => corsProxy.checked === true)
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

  const markComplete = (postId: string, feedId: string) => {
    const newProcessedPostsForFeed = processedPosts.find((processedPostForFeed) => processedPostForFeed.id == feedId)?.processedPosts?.slice()
    putProcessedPost({
      id: feedId,
      processedPosts: Array.from(new Set([newProcessedPostsForFeed, postId].flat())) as string[]
    })
  }

  const putTrainLabel = async (newTrainLabel: TrainLabel) => {
    await db.trainlabels.put(newTrainLabel)
  }

  const removeTrainLabel = async (trainLabelToRemove: TrainLabel) => {
    await db.trainlabels.where('id').equals(trainLabelToRemove?.id).delete()
  }

  const train = (params: {
    mlText: string,
    mlClass: string,
    trainLabel: string
  }) => {
    const oldModel: string = classifiers.find((classifierEntry) => classifierEntry?.id == params.trainLabel)?.model || ''
    const winkClassifier = WinkClassifier()
    winkClassifier.definePrepTasks( [ prepTask ] );
    winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
    if (oldModel != '') {
      winkClassifier.importJSON(oldModel)
    }
    winkClassifier.learn(params.mlText, params.mlClass)
    const newModel: string = winkClassifier.exportJSON()
    const newClassifierEntry = {
      id: params.trainLabel,
      model: newModel,
      thresholdSuppressDocCount: '10',
      thresholdPromoteDocCount: '10'
    }
    putClassifier(newClassifierEntry)
  }

  const putClassifier = async (newClassifierEntry: Classifier) => {
    const winkClassifier = WinkClassifier()
    winkClassifier.definePrepTasks( [ prepTask ] );
    winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
    if (newClassifierEntry.model != '') {
      winkClassifier.importJSON(newClassifierEntry.model)
    }
    if (newClassifierEntry.model === '') {
      return
    }
    if (newClassifierEntry?.id === undefined) {
      return
    }
    await db.classifiers.put(newClassifierEntry)
  }

  const removeClassifier = async (classifierToRemove: Classifier) => {
    await db.classifiers.where('id').equals(classifierToRemove?.id).delete()
  }

  createEffect(() => {
    const feedsForTrainLabel = checkedFeeds
      .filter((feed) => {
        return selectedTrainLabel() === '' || feed.trainLabels.indexOf(selectedTrainLabel()) !== -1
      })
      .map((feed: Feed) => feed.id)
    const corsProxyList = checkedCorsProxies
      .map((corsProxy) => corsProxy.id)
    setFetchRssParams(JSON.stringify({
      feedsForTrainLabel: feedsForTrainLabel,
      corsProxies: corsProxyList
    }))
  })

  function fetchAlbyInvoices(albyTokenReadInvoice: string) {
    const axiosForAlby = axios.create({
      baseURL: 'https://api.getalby.com'
    });
    axiosForAlby.defaults.headers.common['Authorization'] = albyTokenReadInvoice;
    return axiosForAlby.get(`/invoices/incoming`)
    .then(result => [...result.data]
      .filter((invoice: any) => `${invoice.comment}` != '')
      .filter((invoice: any) => invoice.comment != null)
      // the line below is where you would filter by amount paid, etc.
      .reduce((comment: string[], invoice: any) => Array.from(new Set([...comment, invoice.comment])), [])
      .map((comment: string) => nip19.decode(comment))
      .filter((npub: {type: String, data: any}) => npub.type === 'npub')
      .map((npub: {type: String, data: any}) => npub.data)
    )
  }

  function fetchNostrPosts(params: string) {
    return new Promise((resolve) => {
      const paramsObj = JSON.parse(params)
      if (paramsObj.nostrRelayList?.length == 0) {
        return
      }
      const filterOptions = `${paramsObj.nostrAuthor}` != '' ?
      {
        kinds: [ eventKind.text, 30023 ],
        authors: [`${paramsObj.nostrAuthor}`],
      } :
      {
        kinds: [ 1, 30023 ]
      }
      const maxPosts = `${paramsObj.nostrAuthor}` == '' ? 100 : 100
      const winkClassifier = WinkClassifier()
      winkClassifier.definePrepTasks( [ prepTask ] );
      winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
      const classifierModel: string = classifiers.find((classifierEntry: any) => classifierEntry?.id == 'nostr')?.model || ''
      if (classifierModel != '') {
        winkClassifier.importJSON(classifierModel)
      }

      fetcher.fetchLatestEvents(
        [...paramsObj.nostrRelayList],
        filterOptions,
        maxPosts
      )
      .then((allThePosts: any) => {
        const processedNostrPosts = processedPosts.find((processedPostsEntry) => processedPostsEntry?.id == 'nostr')?.processedPosts
        const suppressOdds = classifiers.find((classifierEntry) => classifierEntry?.id == 'nostr')?.thresholdSuppressOdds
        resolve(
          allThePosts
          .filter((nostrPost: any) => `${nostrPost.mlText}`.replace(' ','') != '')
          .filter((nostrPost: any) => !ignoreNostrKeys.find((ignoreKey: {publicKey: string}) => ignoreKey.publicKey == nostrPost.pubkey))
          .map((nostrPost: any) => prepNostrPost(nostrPost))
          .filter((nostrPost: any) => {
            return [processedNostrPosts].flat()?.indexOf(nostrPost.mlText) == -1
          })
          .map((post: any) => applyPrediction({
            post: post,
            classifier: winkClassifier
          }))
          .filter((post: any) => {
            return (post.prediction?.suppress || 0) <= (suppressOdds || 0)
          })
        )
      })
    })
  }
  function fetchRssPosts(params: string) {
    if (params == '') {
      return
    }
    const paramsObj = JSON.parse(params)
    if (paramsObj.feedsForTrainLabel.length < 1) {
      return
    }
    return new Promise((resolve) => {
      const fetchQueue: any[] = []
      paramsObj.feedsForTrainLabel.forEach((feed: Feed) => {
        fetchQueue.push(new Promise((resolve) => {
          try {
            paramsObj.corsProxies?.slice().forEach((corsProxy: any) => {
              try {
                axios.get(`${corsProxy}${feed}`)
                .then(response => {
                  resolve(response)
                })
              } catch(error) {
                console.log(`${corsProxy}${feed} failed`)
              }
            })
          } catch (error) {
            resolve('')
          }
        }))
      })
      const winkClassifier = WinkClassifier()
      winkClassifier.definePrepTasks( [ prepTask ] );
      winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
      const classifierModel: string = classifiers.find((classifierEntry: any) => classifierEntry?.id == selectedTrainLabel())?.model || ''
      if (classifierModel != '') {
        winkClassifier.importJSON(classifierModel)
      }
      Promise.all(fetchQueue)
      .then(fetchedPosts => parsePosts(fetchedPosts))
      .then((parsed: any[]) => {
        const suppressOdds = classifiers.find((classifierEntry) => classifierEntry?.id == selectedTrainLabel())?.thresholdSuppressOdds
        resolve(parsed?.flat()
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
          const processedPostsForFeedLink = processedPosts.find((processedPostsEntry) => processedPostsEntry?.id == processedPostsID)?.processedPosts
          if (processedPostsForFeedLink == undefined) {
            return true
          }
          return processedPostsForFeedLink.indexOf(postItem?.mlText) == -1
        })
        .map((post: any) => applyPrediction({
          post: post,
          classifier: winkClassifier
        }))
        .filter((post: any) => {
          return (post.prediction?.suppress || 0)  <= (suppressOdds || 0)
        })
        )
      })
    })
  }

  const handleFeedToggleChecked = (id: string) => {
    const valuesForSelectedFeed = feeds
    .find(feed => feed['id'] === id)

    const newValueObj = {
        ...valuesForSelectedFeed
      , checked: !valuesForSelectedFeed?.checked
    }
    putFeed({...newValueObj} as Feed)
  }

  return (
  <div>
    <div class='openbtn'>
      <Link.Root
        onClick={event => {
          event.preventDefault()
          setIsOpen(true)
        }}
      >⭢
         </Link.Root>
       </div>
       <NavBar
        navBarWidth={navBarWidth}
        setClose={(event: any) => {
          event.preventDefault()
          setIsOpen(false)
        }}
        isOpen={isOpen}
        trainLabels={trainLabels.filter(trainLabel => trainLabel.checked)}
        setSelectedTrainLabel={(trainLabel: string) => setSelectedTrainLabel(trainLabel)}
       />
      <Routes>
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
            <div>
              <NostrPosts
                selectedTrainLabel={selectedTrainLabel}
                train={(params: {
                  mlText: string,
                  mlClass: string,
                  trainLabel: string
                }) => {
                  train({
                    mlText: params.mlText,
                    mlClass: params.mlClass,
                    trainLabel: 'nostr',
                  })
                }}
                nostrPosts={nostrPosts}
                navBarWidth={navBarWidth}
                selectedNostrAuthor={selectedNostrAuthor}
                setSelectedNostrAuthor={setSelectedNostrAuthor}
                putNostrKey={putNostrKey}
                putProcessedPost={putProcessedPost}
                putClassifier={putClassifier}
                markComplete={(postId: string) => markComplete(postId, 'nostr')}
              />
            </div>
          </Main>
        } path='/nostrposts'
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
              <NostrKeys
                nostrKeys={nostrKeys}
                putNostrKey={putNostrKey}
                removeNostrKey={removeNostrKey}
              />
          </Main>
          }
          path='/nostr'
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
        <Route element={<Main navBarWidth={navBarWidth} isOpen={isOpen}><div><Contribute /></div></Main>} path='/contribute' />
        <Route
          element={
          <Main navBarWidth={navBarWidth} isOpen={isOpen}>
            <Subscribers
              albyIncomingInvoices={albyIncomingInvoices}
            />
          </Main>
          }
          path='/lightning'
        />
        <Route element={
          <Main navBarWidth={navBarWidth} isOpen={isOpen}>
            <div>
              <AlbySignIn
                albyCodeVerifier={albyCodeVerifier}
                setAlbyCodeVerifier={setAlbyCodeVerifier}
                albyCode={albyCode}
                setAlbyCode={setAlbyCode}
                albyTokenReadInvoice={albyTokenReadInvoice}
                setAlbyTokenReadInvoice={setAlbyTokenReadInvoice}
              />
            </div>
          </Main>
        } path='/alby' />
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
            <Feeds
              feeds={feeds}
              putFeed={() => putFeed}
              removeFeed={removeFeed}
              trainLabels={trainLabels}
              handleFeedToggleChecked={(id: string) => handleFeedToggleChecked(id)}
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
            <TrainLabels
              trainLabels={trainLabels}
              putTrainLabel={putTrainLabel}
              removeTrainLabel={removeTrainLabel}
            />
          </Main>
        } path='/trainLabels'
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
                    <div>{selectedTrainLabel()}</div>
                  </Heading>
                  <div>fetching posts</div>
                </div>
              }
            >
              <Posts
                trainLabel={selectedTrainLabel() || 'posts'}
                train={(params: any) => {
                  train({
                    mlText: params.mlText,
                    mlClass: params.mlClass,
                    trainLabel: selectedTrainLabel(),
                  })
                }}
                markComplete={(postId: string, feedId: string) => markComplete(postId, feedId)}
                rssPosts={rssPosts()}
                setSelectedTrainLabel={setSelectedTrainLabel}
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