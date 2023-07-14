import {
  // createSignal,
  Show,
  For
} from 'solid-js';
import {
  Separator,
  Link,
  Collapsible
} from "@kobalte/core";

import Heading from './Heading'
import PostTrain from './PostTrain'
import { CgUserAdd } from 'solid-icons/cg'
import { IoRemoveCircleOutline } from 'solid-icons/io'
import {
  // DbFixture,
  // NostrRelay,
  NostrKey
  //,
  // TrainLabel,
  // Feed,
  // CorsProxy,
  // Classifier,
  // ProcessedPost
} from "./db-fixture";

const NostrPosts = (props: {
  selectedTrainLabel: any,
  train: any,
  nostrPosts: any,
  navBarWidth: number,
  selectedNostrAuthor: any,
  setSelectedNostrAuthor:any,
  putNostrKey: any,
  // processedPosts: any,
  putClassifier: any,
  putProcessedPost: any,
  markComplete: any
}) => {

  // const [processedPostsForSession, setProcessedPostsForSession] = createSignal([])

  const handleClickDrillPubkey = (publicKey: string) => {
    props.setSelectedNostrAuthor(publicKey)
  }

  const handleFollow = (publicKey: string) => {
    const newNostrKey: NostrKey = {
      publicKey: publicKey,
      secretKey:'',
      label:'',
      follow: true,
      ignore: false
    }
    props.putNostrKey(newNostrKey)
  }

  const handleIgnore = (publicKey: string) => {
    const newNostrKey: NostrKey = {
      publicKey: publicKey,
      secretKey:'',
      label:'',
      follow: false,
      ignore: true
    }
    props.putNostrKey(newNostrKey)
  }

  return (
    <main>
      <Heading>
        <div>
          {props.selectedTrainLabel()} global feed
        </div>
      </Heading>
      <Show when={props.selectedNostrAuthor() !== ''}>
        <div style={{'margin': '30px', 'display': 'flex', 'flex-direction': 'row', 'justify-content': 'space-around'}}>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            handleClickDrillPubkey('')
          }}>
            <div color='orange'>
             {`${props.selectedNostrAuthor()}`}
            </div>
          </Link.Root>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            handleFollow(props.selectedNostrAuthor)
            props.setSelectedNostrAuthor('')
          }}>
            <div color='green'>
            <CgUserAdd/>
            </div>
          </Link.Root>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            handleIgnore(props.selectedNostrAuthor)
            props.setSelectedNostrAuthor('')
          }}>
            <div color='red'>
            <IoRemoveCircleOutline />
            </div>
          </Link.Root>
          <div />
          <div />
          <div />
          <div />
        </div>
        <Separator.Root class="separator" />
      </Show>
      <For each={
          props.nostrPosts()
          // .filter((post: any) => post.mlText !== '')
          // .filter((postItem: any) => {
          //   return Array.from(processedPostsForSession()).indexOf(postItem.mlText) == -1
          // })

          } fallback={<>Loading</>}>
          {(post) => {
            return (
              <>
              {
                <Collapsible.Root class="collapsible" defaultOpen={true}>
                  <Collapsible.Content class="collapsible__content">
                    <p class="collapsible__content-text">
                    {
                      <>
                          <Link.Root style={{'color': 'orange'}}onClick={(event) => {
                            event.preventDefault()
                            handleClickDrillPubkey(post.pubkey)
                          }}>
                            {`${post.pubkey.substring(0,5)}...${post.pubkey.substring(post.pubkey.length - 5)}`}
                          </Link.Root>

                        <div style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</div>
                        <div>
                          {post.content}
                        </div>
                        <Collapsible.Trigger class="collapsible__trigger">
                        <PostTrain
                          // classifierJSON={classifierJSON()}
                          trainLabel={'nostr'}
                          train={(mlClass: string) => props.train(mlClass, post.mlText)}
                          mlText={post.mlText}
                          prediction={post.prediction}
                          docCount={post.docCount}
                          // putProcessedPost={props.putProcessedPost(post.id)}
                          markComplete={() => props.markComplete(post.id)}
                          // postId={post.id}
                          // putClassifier={props.putClassifier}
                          // setProcessedPostsForSession={setProcessedPostsForSession}
                          // processedPostsForSession={processedPostsForSession()}
                        />
                      </Collapsible.Trigger>
              </>}
                </p>
              </Collapsible.Content>
            </Collapsible.Root>
          }</>
            )
          }}
        </For>
    </main>
  )
}
export default NostrPosts;

// <Button.Root onClick={props.handleTrain({mlText: 'world peace', mlClass:'promote'})}>NostrPosts.tsx</Button.Root>