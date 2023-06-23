import {
  createSignal,
  Suspense,
  Signal,
  createEffect,
  Component
} from 'solid-js';

import { eventKind, NostrFetcher } from "nostr-fetch";

import { Link } from "@kobalte/core";

import {
  Routes,
  Route
} from '@solidjs/router';

import {
  fetchPosts,
  cleanNostrPost
} from './tools'

import { AiOutlineArrowRight } from 'solid-icons/ai'
import Contribute from './Contribute';
import NostrKeys from './NostrKeys';
import NostrRelays from './NostrRelays'
import NostrPosts from './NostrPosts';
import Feeds from './Feeds';
import Categories from './Categories';
import Classifiers from './Classifiers';
import CorsProxies from './CorsProxies';
import Posts from './Posts';
import NavBar from './NavBar';
import Main from './Main';

import { DbFixture } from "./db-fixture";

import defaultFeeds from './assets/defaultFeeds.json'
import { Feed } from './db-fixture'

import defaultCorsProxies from './assets/defaultCorsProxies.json'
import { CorsProxy } from './db-fixture'

import defaultNostrRelays from './assets/defaultNostrRelays.json'
import { NostrRelay } from './db-fixture'

import defaultNostrKeys from './assets/defaultNostrKeys.json'
import { NostrKey } from './db-fixture'

import defaultCategories from './assets/defaultCategories.json'
import { Category } from './db-fixture'

import defaultClassifiers from './assets/defaultClassifiers.json'
import { Classifier } from './db-fixture'

import defaultProcessed from './assets/defaultProcessed.json'
import { ProcessedPost } from './db-fixture'

import { createDexieArrayQuery } from "solid-dexie";

import Heading from './Heading'

const navBarWidth = 250
const fetcher = NostrFetcher.init();
const db = new DbFixture();

db.on("populate", () => {
  db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  db.feeds.bulkAdd(defaultFeeds as Feed[]);
  db.corsproxies.bulkAdd(defaultCorsProxies as CorsProxy[]);
  db.categories.bulkAdd(defaultCategories as Category[]);
  db.classifiers.bulkAdd(defaultClassifiers as Classifier[]);
  db.processedposts.bulkAdd(defaultProcessed as ProcessedPost[]);
});

const App: Component = () => {

  function createStoredSignal<T>(
      key: string,
      defaultValue: T,
      storage = localStorage
  ): Signal<T> {

    const initialValue = storage.getItem(key)
      ? JSON.parse(storage.getItem(key)) as T
      : defaultValue;

    const [value, setValue] = createSignal<T>(initialValue);

    const setValueAndStore = ((arg) => {
      const v = setValue(arg);
      storage.setItem(key, JSON.stringify(v));
      return v;
    }) as typeof setValue;

    return [value, setValueAndStore];
  }

  const classifiers = createDexieArrayQuery(() => db.classifiers.toArray());
  const nostrKeys = createDexieArrayQuery(() => db.nostrkeys.toArray());
  const ignoreNostrKeys = createDexieArrayQuery(() => db.nostrkeys
  .filter(nostrKey => nostrKey.ignore === true)
  .toArray()
  );
  const nostrRelays = createDexieArrayQuery(() => db.nostrrelays.toArray());
  const checkedNostrRelays = createDexieArrayQuery(() => db.nostrrelays
    .filter(feed => feed.checked === true)
    .toArray());

  const putNostrKey = async (newKey) => {
    await db.nostrkeys.put(newKey)
  }

  const removeNostrKey = async (nostrKeyRemove) => {
    await db.nostrkeys.where('publicKey').equals(nostrKeyRemove.publicKey).delete()
  }


  const putNostrRelay = async (newNostrRelay) => {
    await db.nostrrelays.put(newNostrRelay)
  }
  const removeNostrRelay = async (nostrRelayToRemove) => {
    await db.nostrrelays.where('id').equals(nostrRelayToRemove.id).delete()
  }

  const feeds = createDexieArrayQuery(() => db.feeds.toArray());

  const checkedFeeds = createDexieArrayQuery(() => db.feeds
    .filter(feed => feed.checked === true)
    .toArray());

  const putFeed = async (newFeed) => {
    await db.feeds.put(newFeed)
  }

  const removeFeed = async (feedRemove) => {
    await db.feeds.where('id').equals(feedRemove.id).delete()
  }

  const corsProxies = createDexieArrayQuery(() => db.corsproxies.toArray());

  const putCorsProxy = async (newCorsProxy) => {
    await db.corsproxies.put(newCorsProxy)
  }
  const removeCorsProxy = async (corsProxyToRemove) => {
    await db.corsproxies.where('id').equals(corsProxyToRemove.id).delete()
  }

  const processedPosts = createDexieArrayQuery(() => db.processedposts.toArray());

  const putProcessedPost = async (newProcessedPost) => {
    await db.processedposts.put(newProcessedPost)
  }

  const categories = createDexieArrayQuery(() => db.categories.toArray());

  const putCategory = async (newCategory) => {
    await db.categories.put(newCategory)
  }

  const removeCategory = async (categoryToRemove) => {
    await db.categories.where('id').equals(categoryToRemove.id).delete()
  }

  const putClassifier = async (newClassifierEntry) => {
    if (newClassifierEntry.algorithm === '') {
      return
    }
    if (newClassifierEntry.id === undefined) {
      return
    }

    let oldClassifier = await db.classifiers.get(newClassifierEntry.id)

    if (newClassifierEntry.algorithm == oldClassifier?.algorithm) {
      return
    }
    await db.classifiers.put(newClassifierEntry)
  }

  const removeClassifier = async (classifierToRemove) => {
    await db.classifiers.where('id').equals(classifierToRemove.id).delete()
  }

  const [posts, setPosts] = createSignal<object[]>([])
  const [nostrPosts, setNostrPosts] = createSignal<object[]>([])
  const [isOpen, setIsOpen] = createStoredSignal('isSideNavOpen', false)
  const [selectedCategory, setSelectedCategory] = createStoredSignal('selectedCategory', '')
  const [selectedNostrAuthor, setSelectedNostrAuthor] = createStoredSignal('selectedNostrAuthor', '')

  createEffect(() => {
    const feedsForCategory = checkedFeeds.filter((feed) => selectedCategory() === '' || feed.categories.indexOf(selectedCategory()) !== -1)
      .map((feed) => {
        return {...feed}
      })
    fetchPosts(feedsForCategory, processedPosts, corsProxies)
    .then((parsedPosts: {
      mlText: string,
      feedLink: string,
      guid?: string
    }[]) => {
      const postsNonEmpty = parsedPosts.filter(post => post?.mlText != null).slice()
      setPosts(postsNonEmpty)
    })
  })

  createEffect(() => {
    const selectedNostrAuthorToFetch = selectedNostrAuthor().toString()
    const filterOptions = selectedNostrAuthorToFetch ?
    {
      kinds: [ eventKind.text ],
      authors: [selectedNostrAuthorToFetch],
    } :
    {
      kinds: [ eventKind.text ]
    }

    fetcher.fetchLatestEvents(
      [...checkedNostrRelays.map((nostrRelay) => nostrRelay['id'])],
      filterOptions,
      selectedNostrAuthorToFetch ? 100 : 500,
    ).then((allPosts) => {
      setNostrPosts(
        allPosts
        .filter(nostrPost => !ignoreNostrKeys.find(ignoreKey => ignoreKey.publicKey == nostrPost.pubkey))
        .map(nostrPost => cleanNostrPost(nostrPost))
      )
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
          <AiOutlineArrowRight />
        </Link.Root>
      </div>
      <NavBar
        navBarWidth={navBarWidth}
        categories={categories.filter(category => category.checked)}
        handleClose={() => setIsOpen(false)}
        isOpen={isOpen}
        setSelectedCategory={setSelectedCategory}
      />
      <Routes>
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
            <NostrKeys
              nostrKeys={nostrKeys}
              putNostrKey={putNostrKey}
              removeNostrKey={removeNostrKey}
            />
          </Main>
        } path='/nostr'
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
                category={selectedCategory()}
                setSelectedCategory={setSelectedCategory}
                posts={posts}
                classifiers={classifiers}
                putClassifier={putClassifier}
                processedPosts={processedPosts}
                putProcessedPost={putProcessedPost}
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
  )
}
export default App;