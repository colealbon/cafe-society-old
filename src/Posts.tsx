import Classifier from 'wink-naive-bayes-text-classifier';
import {
  createEffect,
  For,
  createSignal,
  Suspense
} from 'solid-js'
import {
  useParams
} from '@solidjs/router'

import Heading from './Heading'
import PostDisplay from './PostDisplay'
import PostTrain from './PostTrain'
import { Collapsible } from "@kobalte/core";
import "./style.css";

const removePunctuation = (text: string) => {
  return `${text}`
    .replace(/[/?…".,#!$%^&*;:{}=_`~()'’‘“”]/g, '')
    .replace(/\s{2,}/g, ' ');
};

export const shortUrl = (text: string) => {
  try {
    const theUrl = new URL(text);
    const newPath = removePunctuation(`${theUrl.hostname}${theUrl.pathname}`)
      .replace(/-/g, '')
      .toLowerCase();
    return newPath;
  } catch (error) {
    console.log(error)
    console.log(text)
  }
};

const Posts = (props: any) => {
  const [classifier, setClassifier] = createSignal(Classifier());
  const [classifierJSON, setClassifierJSON] = createSignal('')
  const [processedPostsForSession, setProcessedPostsForSession] = createSignal([])
  createEffect(() => {
    const classifierEntry = [props.classifiers].flat().find((classifierEntry: any) => classifierEntry?.id == props.category)
    let classifierForCategory = Classifier()
    if (classifierEntry?.model != null) {
      console.log(classifierEntry.model)
      classifierForCategory.importJSON(classifierEntry.model)
      // classifierForCategory = natural.BayesClassifier.restore(JSON.parse(classifierEntry?.model));
    }
    setClassifier(classifierForCategory)
  })
  createEffect(() => {
    const classifierJSON = classifier().exportJSON()
    setClassifierJSON(classifierJSON)
  })

  createEffect(() => {
    try {
      if (`${useParams().category}` === 'undefined') {
        props.setSelectedCategory('')
        return
      }
      props.setSelectedCategory(`${useParams().category}`)
    } catch (error) {
      console.log(error)
      return
    }
  })

  return (
    <div>
      <div class="fade-in">
        <Heading>
          <div>{useParams().category || 'posts'}</div>
        </Heading>
      </div>
      <For each={
        props.posts()
        .filter((postItem: {mlText: string}) => {
          const theMlText = postItem?.mlText?.toString()
          return [...Array.from(processedPostsForSession())].indexOf(theMlText) == -1
        })
        .filter((postItem: any) => {
          const theMlText = postItem?.mlText?.toString()
          const processedPostsID = postItem.feedLink === "" ? postItem.guid : shortUrl(postItem.feedLink)
          const processedPostsForFeedLink = [props.processedPosts].flat().slice()
            .find((processedPostEntry: any) => processedPostEntry?.id === processedPostsID)?.processedPosts
          if (processedPostsForFeedLink == undefined) {
            return true
          }
          return processedPostsForFeedLink.indexOf(theMlText) == -1
        })
        .map((post: any) => props.applyPrediction(post, props.category))
        } fallback={<div class='fade-in-slow'>LOADING</div>}
      >
        {(post) => {
          return (
            <Suspense>
            {
              <Collapsible.Root class="collapsible" defaultOpen={true}>
                <Collapsible.Content class="collapsible__content">
                  <p class="collapsible__content-text">
                  {
                    <>
                      <PostDisplay {...post} />
                      <Collapsible.Trigger class="collapsible__trigger">
                        <PostTrain
                          category={props.category}
                          classifierJSON={classifierJSON()}
                          setClassifier={setClassifier}
                          mlText={post?.mlText}
                          prediction={post.prediction}
                          postId={`${post.feedLink}` === '' ? post.guid : shortUrl(post.feedLink)}
                          putProcessedPost={props.putProcessedPost}
                          putClassifier={props.putClassifier}
                          setProcessedPostsForSession={setProcessedPostsForSession}
                          processedPostsForSession={processedPostsForSession()}
                        />
                      </Collapsible.Trigger>
                      </>
                    }
                    </p>
                  </Collapsible.Content>
                </Collapsible.Root>
              }
            </Suspense>
          )}}
      </For>
    </div>
  )
}
export default Posts;


