import {
  Signal,
  createSignal,
  createEffect
} from 'solid-js';
import {
  Routes,
  Route
} from '@solidjs/router';
import Main from './Main';
import NostrPosts from './NostrPosts'
import NavBar from './NavBar';
import { Link } from "@kobalte/core";

const navBarWidth = 250

// import { convert } from 'html-to-text'
// import WinkClassifier from 'wink-naive-bayes-text-classifier';
// import winkNLP from 'wink-nlp'
// import model from 'wink-eng-lite-web-model'
import {
  DbFixture,
//   NostrRelay,
//   Category,
//   Feed,
//   CorsProxy,
  Classifier,
//   ProcessedPost
} from "./db-fixture";
// import axios from 'axios';
// import { XMLParser } from 'fast-xml-parser'
import { createDexieArrayQuery } from "solid-dexie";
// import Posts from './Posts'
// import NostrKeys from './NostrKeys';
// import Feeds from './Feeds';
// import CorsProxies from './CorsProxies';
// import NostrRelays from './NostrRelays';
// import Categories from './Categories';
// import Classifiers from './Classifiers';
// import Heading from './Heading';
// import Contribute from './Contribute';
// import defaultNostrKeys from './defaultNostrKeys';
// import defaultNostrRelays from './defaultNostrRelays';
// import defaultFeeds from './defaultFeeds';
// import defaultCorsProxies from './defaultCorsProxies';
// import defaultCategories from './defaultCategories';
import defaultClassifiers from './defaultClassifiers';
// import defaultProcessed from './defaultProcessed';
// import { NostrKey } from './db-fixture'
const db = new DbFixture();
// const parser = new XMLParser();

// const nlp = winkNLP( model );
// const its = nlp.its;

db.on("populate", () => {
  // db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  // db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  // db.feeds.bulkAdd(defaultFeeds as Feed[]);
  // db.corsproxies.bulkAdd(defaultCorsProxies as CorsProxy[]);
  // db.categories.bulkAdd(defaultCategories as Category[]);
  db.classifiers.bulkAdd(defaultClassifiers as Classifier[]);
  // db.processedposts.bulkAdd(defaultProcessed as ProcessedPost[]);
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
const [selectedTrainLabel, setSelectedTrainLabel] = createStoredSignal('selectedTrainLabel', '')

// const prepTask = function ( text: string ) {
//   const tokens: string[] = [];
//   nlp.readDoc(text)
//       .tokens()
//       // Use only words ignoring punctuations etc and from them remove stop words
//       .filter( (t: any) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
//       // Handle negation and extract stem of the word
//       .each( (t: any) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );
//   return tokens;
// };

// const parseRSS = (content:any) => {
//   const feedTitle = content.rss.channel.title
//   const feedLink = content.rss.channel.link
//   const feedDescription = content.rss.channel.description
//   const feedPosts = content.rss.channel.item.length == null ?
//     [content.rss.channel.item] :
//     content.rss.channel.item

//   return [...feedPosts]
//     .map((itemEntry) => ({
//       feedTitle: feedTitle,
//       feedLink: feedLink,
//       feedDescription: feedDescription,
//       ...itemEntry
//     }))
//     .map(itemEntry => ({
//       postSummary: convert(
//         itemEntry.description,
//         {
//           ignoreLinks: true,
//           ignoreHref: true,
//           ignoreImage: true,
//           linkBrackets: false
//         })
//       .replace(/\[.*?\]/g, '')
//       .replace(/\n/g,' ')?.toString()
//       .trim(),
//       ...itemEntry
//     }))
//     .map(itemEntry => ({
//       ...itemEntry,
//       postId: itemEntry.link || itemEntry.guid,
//       postTitle: itemEntry.title,
//       mlText: prepTask(convert(`${itemEntry.title} ${itemEntry.postSummary}`))
//         .filter((word) => word.length < 30)
//         .join(' ')
//         .toLowerCase()
//     })
//   )
// }
// const parseAtom = (content: any) => {
//   const feedTitle = content.feed?.feedTitle
//   const feedLink = content.feed?.id
//   const feedDescription = content.feed?.subtitle
//   const feedPosts = content.feed?.entry
//   return feedPosts?.map((itemEntry: any) => ({
//       feedTitle: feedTitle,
//       feedLink: feedLink,
//       feedDescription: feedDescription,
//       ...itemEntry[0]
//     }))
//     .map((itemEntry: any) => ({
//       postSummary: convert(itemEntry.content, { ignoreLinks: true, ignoreHref: true, ignoreImage: true, linkBrackets: false  })
//       .replace(/\[.*?\]/g, '')
//       .replace(/\n/g,' ')?.toString()
//       .trim(),
//       ...itemEntry
//     }))
//     .map((itemEntry: any) => ({
//       ...itemEntry,
//       postId: itemEntry?.id,
//       postTitle: `${itemEntry.title}`,
//       mlText: prepTask(convert(`${itemEntry.title} ${itemEntry.postSummary}`))
//         .filter((word) => word.length < 30)
//         .join(' ')
//         .toLowerCase()
//     })
//   )
// }
// const parsePosts = (postsXML: any[]) => {
//   const parseQueue: any[] = []
//   postsXML.forEach(xmlEntry => {
//     parseQueue.push(new Promise(resolve => {
//       const content = parser.parse(xmlEntry.data)
//       const parsed = content.rss ? parseRSS(content) : parseAtom(content)
//       resolve(parsed)
//     }))
//   })
//   return Promise.all(parseQueue)
// }

// const removePunctuation = (text: string) => {
//   return `${text}`
//     .replace(/[/?…".,#!$%^&*;:{}=_`~()'’‘“”]/g, '')
//     .replace(/\s{2,}/g, ' ');
// };

// const shortUrl = (text: string) => {
//   const theUrl = new URL(text);
//   const newPath = removePunctuation(`${theUrl.hostname}${theUrl.pathname}`)
//     .replace(/-/g, '')
//     .toLowerCase();
//   return newPath;
// };

const App = () => {
  const [isOpen, setIsOpen] = createSignal(false)
  const categories = createDexieArrayQuery(() => db.categories.toArray());
//   const nostrKeys = createDexieArrayQuery(() => db.nostrkeys.toArray());
//   const ignoreNostrKeys = createDexieArrayQuery(() => db.nostrkeys
//   .filter(nostrKey => nostrKey.ignore === true)
//   .toArray()
//   );
//   const putNostrKey = async (newKey: NostrKey) => {
//     await db.nostrkeys.put(newKey)
//   }
//   const removeNostrKey = async (nostrKeyRemove: NostrKey) => {
//     await db.nostrkeys.where('publicKey').equals(nostrKeyRemove.publicKey).delete()
//   }

  const [selectedClassifier, setSelectedClassifier] = createSignal()
  const [selectedMlText, setSelectedMlText] = createSignal()
  const [selectedMlClass, setSelectedMlClass] = createSignal()

  const classifiers = createDexieArrayQuery(() => db.classifiers.toArray());

//   const putNostrRelay = async (newNostrRelay: NostrRelay) => {
//     await db.nostrrelays.put(newNostrRelay)
//   }
//   const removeNostrRelay = async (nostrRelayToRemove: NostrRelay) => {
//     await db.nostrrelays.where('id').equals(nostrRelayToRemove?.id).delete()
//   }

//   const feeds = createDexieArrayQuery(() => db.feeds.toArray());

//   const checkedFeeds = createDexieArrayQuery(() => db.feeds
//     .filter(feed => feed.checked === true)
//     .toArray());

//   const putFeed = async (newFeed: Feed) => {
//     await newFeed?.id && db.feeds.put(newFeed)
//   }

//   const removeFeed = async (feedRemove: Feed) => {
//     await db.feeds.where('id').equals(feedRemove?.id).delete()
//   }

//   const corsProxies = createDexieArrayQuery(() => db.corsproxies.toArray());

//   const putCorsProxy = async (newCorsProxy: CorsProxy) => {
//     await db.corsproxies.put(newCorsProxy)
//   }
//   const removeCorsProxy = async (corsProxyToRemove: CorsProxy) => {
//     await db.corsproxies.where('id').equals(corsProxyToRemove?.id).delete()
//   }

//   const processedPosts = createDexieArrayQuery(() => db.processedposts.toArray());

//   const putProcessedPost = async (newProcessedPost: ProcessedPost) => {
//     await db.processedposts.put(newProcessedPost)
//   }

//   const putCategory = async (newCategory: Category) => {
//     await db.categories.put(newCategory)
//   }

//   const removeCategory = async (categoryToRemove: Category) => {
//     await db.categories.where('id').equals(categoryToRemove?.id).delete()
//   }
//   const cleanNostrPost = (post: any) => {
//     return {
//       mlText: prepTask(convert(
//           `${post.content}`.replace(/\d+/g, ''),
//           {
//             ignoreLinks: true,
//             ignoreHref: true,
//             ignoreImage: true,
//             linkBrackets: false
//           }
//         ))
//         .filter((word) => word.length < 30)
//         .join(' ')
//         .toLowerCase() || '',
//       ...post
//     }
//   }

  createEffect(() => {
    // const classifierEntry: Classifier | undefined = classifiers.find((classifierEntry) => classifierEntry?.id == selectedTrainLabel())
    setSelectedClassifier(
      classifiers.find((classifierEntry) => classifierEntry?.id == selectedTrainLabel())?.model
    )
  })

//   createEffect(() => {
//     const classifierEntry: Classifier | undefined = classifiers.find((classifierEntry) => classifierEntry?.id == selectedTrainLabel())
//     if (classifierEntry === undefined) {
//       let winkClassifier = WinkClassifier()
//       const prepTask = function ( text: string ) {
//         const tokens: string[] = [];
//         nlp.readDoc(text)
//           .tokens()
//           // Use only words ignoring punctuations etc and from them remove stop words
//           .filter( (t: any) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
//           // Handle negation and extract stem of the word
//           .each( (t: any) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );
//         return tokens;
//       };
//       winkClassifier.definePrepTasks( [ prepTask ] );
//       winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
//       const newClassifierEntry: string = winkClassifier.exportJSON()
//       setSelectedClassifier(newClassifierEntry)
//     } else {
//       setSelectedClassifier(classifierEntry.model)
//     }
//   })

//   const applyPrediction = (post: any, classifier: any) => {
//     try {
//       const docCount: number = Object.values(classifier.stats().labelWiseSamples).reduce((val, runningTotal: any) => val as number + runningTotal) as number
//       if (docCount > 2) {
//         classifier.consolidate()
//       }
//       const prediction = classifier.computeOdds(post?.mlText)
//       const postWithPrediction = {
//         ...post,
//         ...{
//           'prediction': prediction,
//           'docCount': docCount
//         }
//       }
//       return postWithPrediction
//     } catch (error) {
//       if (error != null) {
//         return post
//       }
//     }
//   }

//   const putClassifier = async (newClassifierEntry: Classifier) => {
//     if (newClassifierEntry.model === '') {
//       return
//     }
//     if (newClassifierEntry?.id === undefined) {
//       return
//     }

//     let oldClassifier = await db.classifiers.get(newClassifierEntry?.id)

//     if (newClassifierEntry.model == oldClassifier?.model) {
//       return
//     }
//     await db.classifiers.put(newClassifierEntry)
//   }

//   const removeClassifier = async (classifierToRemove: Classifier) => {
//     await db.classifiers.where('id').equals(classifierToRemove?.id).delete()
//   }

//   const [posts, setPosts] = createSignal<object[]>([])

//   // createEffect(
//   //   selectedTrainLabel()
//   // )

//   const [selectedNostrAuthor, setSelectedNostrAuthor] = createStoredSignal('selectedNostrAuthor', '')
//   const nostrRelays = createDexieArrayQuery(() => db.nostrrelays.toArray());
//   const checkedNostrRelays = createDexieArrayQuery(() => db.nostrrelays
//     .filter(feed => feed.checked === true)
//     .toArray());

//   createEffect(() => {
//     const feedsForCategory = checkedFeeds
//       .filter((feed) => selectedTrainLabel() === '' || feed.categories.indexOf(selectedTrainLabel()) !== -1)
//     const fetchQueue: any[] = []
//     feedsForCategory.forEach((feed: Feed) => {
//       fetchQueue.push(new Promise((resolve) => {
//         try {
//           corsProxies?.slice().forEach((corsProxy) => {
//             axios.get(`${corsProxy.id}${feed.id}`)
//             .then(response => {
//               resolve(response)
//             })
//           })
//         } catch (error) {
//           resolve('')
//         }
//       }))
//     })
//     Promise.all(fetchQueue)
//     .then(fetchedPosts => parsePosts(fetchedPosts))
//     .then((parsed: any[]) => {
//       setPosts(parsed.flat()
//       .filter(post => `${post?.mlText}`.trim() != '')
//       .map(post => {
//         return {
//           ...post,
//           postTitle: post?.postTitle
//           .replace(/&#039;/g, "'")
//           .replace(/&#8217;/g, "'")
//           .replace(/&#8211;/g, "-")
//           .replace(/&#8216;/g, "'")
//           .replace(/&#038;/g, "&")
//         }
//       })
//       .filter((postItem: any) => {
//         const processedPostsID = postItem.feedLink === "" ? postItem.guid : shortUrl(postItem.feedLink)
//         const processedPostsForFeedLink = processedPosts.slice()
//         .find((processedPostEntry: any) => processedPostEntry?.id === processedPostsID)?.processedPosts.slice()
//         if (processedPostsForFeedLink == undefined) {
//           return true
//         }
//         return processedPostsForFeedLink.indexOf(postItem?.mlText) == -1
//       })
//       .map((post) => applyPrediction(post, selectedClassifier())))
//     })
//   })

  createEffect(() => {
    console.log(selectedClassifier())
    console.log(selectedTrainLabel())
    console.log(selectedMlText())
    console.log(selectedMlClass())

      // classifier.definePrepTasks( [ prepTask ] );
      // classifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
      // try {
      //   if (`${props.classifierJSON}` != '')  {
      //     winkClassifier.importJSON(props.classifierJSON)
      //   }
      // } catch (error) {
      //   console.log(error)
      //   console.log(props.classifierJSON)
      // }
      // const nlp = winkNLP( model );
      // const its = nlp.its;

      // classifier.learn(mlText, mlClass)
      // const classifierEntry = {
      //   id: category,
      //   model: classifier.exportJSON()
      // } as Classifier
      // console.log(classifier.stats())
      // putClassifier(classifierEntry)
  })

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
        categories={categories.filter(category => category.checked)}
        setSelectedTrainLabel={(theLabel: string) => setSelectedTrainLabel(theLabel)}
       />
      <div>{selectedTrainLabel()}</div>
      <Routes>
        <Route element={
          <Main
            navBarWidth={navBarWidth}
            isOpen={isOpen}
          >
            <NostrPosts
              handleTrain={(params: {mlText: string, mlClass: string}) => {
                setSelectedMlText(params.mlText)
                setSelectedMlClass(params.mlClass)
              }}
              navBarWidth={navBarWidth}
            />
          </Main>
        } path='/nostrposts'
        />
      </Routes>
    </div>
  );
};

export default App;


{/* <NostrPosts />
    // setSelectedNostrAuthor={setSelectedNostrAuthor}
    // // selectedNostrAuthor={selectedNostrAuthor()}
    // // setNostrPosts={setNostrPosts}
    // nostrPosts={nostrPosts()}
    // train={(mlClass: string, mlText: string) => handleTrain(mlText,
    //   mlClass,
    //   selectedTrainLabel(),
    //   selectedTrainLabel())}
    // putClassifier={putClassifier}
    // processedPosts={processedPosts}
    // putProcessedPost={putProcessedPost}
    // putNostrKey={putNostrKey}
  /> */}

//         <Route element={
//             <Main
//               navBarWidth={navBarWidth}
//               isOpen={isOpen}
//             >
//               <NostrKeys
//                 nostrKeys={nostrKeys}
//                 putNostrKey={putNostrKey}
//                 removeNostrKey={removeNostrKey}
//               />
//             </Main>
//           } path='/nostr'
//           />
//         <Route element={<Main navBarWidth={navBarWidth} isOpen={isOpen}><div><Contribute /></div></Main>} path='/contribute' />
//         <Route element={
//           <Main
//             navBarWidth={navBarWidth}
//             isOpen={isOpen}
//           >
//             <Feeds
//               feeds={feeds}
//               putFeed={putFeed}
//               removeFeed={removeFeed}
//               categories={categories}
//             />
//           </Main>
//         } path='/feeds'
//         />
//         <Route element={
//           <Main
//             navBarWidth={navBarWidth}
//             isOpen={isOpen}
//           >
//               <CorsProxies
//               corsProxies={corsProxies}
//               putCorsProxy={putCorsProxy}
//               removeCorsProxy={removeCorsProxy}
//              />
//             </Main>
//         } path='/cors'
//         />
//         <Route element={
//           <Main
//             navBarWidth={navBarWidth}
//             isOpen={isOpen}
//           >
//               <NostrRelays
//               nostrRelays={nostrRelays}
//               putNostrRelay={putNostrRelay}
//               removeNostrRelay={removeNostrRelay}
//              />
//             </Main>
//         } path='/nostrrelays'
//         />
//         <Route element={
//           <Main
//             navBarWidth={navBarWidth}
//             isOpen={isOpen}
//           >
//             <Categories
//               categories={categories}
//               putCategory={putCategory}
//               removeCategory={removeCategory}
//             />
//           </Main>
//         } path='/categories'
//         />
//         <Route element={
//           <Main
//             navBarWidth={navBarWidth}
//             isOpen={isOpen}
//           >
//             <Classifiers
//               classifiers={classifiers}
//               putClassifier={putClassifier}
//               removeClassifier={removeClassifier}
//             />
//           </Main>
//         } path='/classifiers'
//         />
//         <Route
//           element={
//             <Main
//               navBarWidth={navBarWidth}
//               isOpen={isOpen}
//             >
//             <Suspense
//               fallback={
//                 <div class='fade-in'>
//                   <Heading>
//                     <div>{selectedTrainLabel()}</div>
//                   </Heading>
//                   <div>fetching posts</div>
//                 </div>
//               }
//             >
//               <Posts
//                 category={selectedTrainLabel}
//                 setSelectedTrainLabel={setSelectedTrainLabel}
//                 posts={posts}
//                 classifiers={classifiers}
//                 putClassifier={putClassifier}
//                 processedPosts={processedPosts}
//                 putProcessedPost={putProcessedPost}
//                 applyPrediction={(post: any) => applyPrediction(post, selectedTrainLabel())}
//                />
//             </Suspense>
//             </Main>
//           }
//           path={[
//             '/',
//             '/posts',
//             '/posts/:category'
//           ]}
//         />