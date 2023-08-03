import {
  For,
  Suspense,
  createEffect
} from 'solid-js'
import Heading from './Heading'
import PostDisplay from './PostDisplay'
import PostTrain from './PostTrain'
import { Collapsible } from "@kobalte/core";
import {
  useParams
} from '@solidjs/router'

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

const Posts = (props: {
  trainLabel: string,
  setSelectedTrainLabel: any,
  train: any,
  rssPosts: any,
  markComplete: any
}) => {

createEffect(() => {
  try {
    if (`${useParams().category}` === 'undefined') {
      props.setSelectedTrainLabel('')
      return
    }
    props.setSelectedTrainLabel(`${useParams().category}`)
  } catch (error) {
    console.log(error)
    return
  }
})

  return (
    <div>
      <div class="fade-in">
        <Heading>
          <div>{props.trainLabel || 'posts'}</div>
        </Heading>
      </div>
      <For each={props.rssPosts?.flat()} fallback={<div class='fade-in-slow'>LOADING</div>}>
        {(post) => {
          const processedPostsID = post.feedLink === "" ? post.guid : shortUrl(post.feedLink)
          return (
            <Suspense>
            {
              <Collapsible.Root class="collapsible" defaultOpen={true}>
                <Collapsible.Content class="collapsible__content">
                  <p class="collapsible__content-text">
                  {
                    <>
                      <PostDisplay {...post}/>
                      <Collapsible.Trigger class="collapsible__trigger">
                      <PostTrain
                        trainLabel={props.trainLabel}
                        train={(mlClass: string) => {
                          props.train({
                            mlClass: mlClass,
                            mlText: post.mlText
                          })
                        }}
                        mlText={post.mlText}
                        prediction={post.prediction}
                        docCount={post.docCount}
                        markComplete={() => props.markComplete(post.mlText, processedPostsID)}
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