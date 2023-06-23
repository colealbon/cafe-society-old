import natural from 'natural'
import {shortUrl} from './tools'
import {
  createEffect,
  For,
  createSignal
} from 'solid-js'
import {
  useParams
} from '@solidjs/router'
import Heading from './Heading'
import PostDisplay from './PostDisplay'
import PostTrain from './PostTrain'
import { Collapsible } from "@kobalte/core";
import "./style.css";

const Posts = (props) => {
  const [classifier, setClassifier] = createSignal(new natural.BayesClassifier());
  const [processedPostsForSession, setProcessedPostsForSession] = createSignal([])
  createEffect(() => {
    if (`${useParams().category}` === 'undefined') {
      props.setSelectedCategory('')
      return
    }
    props.setSelectedCategory(`${useParams().category}`)
  })

  createEffect(() => {
    const classifierEntry = props.classifiers.find((classifierEntry) => classifierEntry.id == props.category)
    const classifierJSON = classifierEntry?.algorithm
    let classifierForCategory = new natural.BayesClassifier()
    if (`${classifierJSON}` != '' && `${classifierJSON}` != 'undefined') {
      classifierForCategory = natural.BayesClassifier.restore(JSON.parse(classifierJSON));
    }
    setClassifier(classifierForCategory)
  })

  return (
    <div>
      <div class="fade-in">
        <Heading>
          <div>{props.category || 'posts'}</div>
        </Heading>
      </div>
      <For each={
        props.posts()
        .filter((postItem) => {
          return Array.from(processedPostsForSession()).indexOf(postItem.mlText) == -1
        })
        .filter((postItem) => {
          const processedPostsID = shortUrl(postItem.feedLink === "" ? postItem.guid : postItem.feedLink)
          const processedPostsForFeedLink = props.processedPosts.slice()
          .find(processedPostEntry => processedPostEntry.id === processedPostsID)?.processedPosts.slice()
          if (processedPostsForFeedLink == undefined) {
            return true
          }
          return processedPostsForFeedLink.indexOf(postItem.mlText) == -1
        })
        .map(post => {
          const prediction = classifier().getClassifications(post.mlText)
          return {...post, ...{'prediction': prediction}}
        })
        } fallback={<div class='fade-in-slow'>LOADING</div>}
      >
        {(post) => {
          return (
            <>
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
                          classifier={classifier}
                          mlText={post.mlText}
                          prediction={post.prediction}
                          postId={shortUrl(post.feedLink === '' ? post.guid : post.feedLink)}
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
          </>
        )}}
      </For>
    </div>
  )
}
export default Posts;