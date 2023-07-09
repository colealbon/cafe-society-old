import WinkClassifier from 'wink-naive-bayes-text-classifier';
import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import PostTrain from './PostTrain'
import Heading from './Heading'
import { NostrKey } from './db-fixture'
import { CgUserAdd } from 'solid-icons/cg'
import { IoRemoveCircleOutline } from 'solid-icons/io'
import { Separator } from "@kobalte/core";
import {
  createEffect,
  createSignal,
  For,
  Show
} from 'solid-js'
import { Collapsible, Link } from "@kobalte/core";

const nlp = winkNLP( model );
const its = nlp.its;

const NostrPosts = (props: any) => {
  const [classifierJSON, setClassifierJSON] = createSignal('')
  const [classifier, setClassifier] = createSignal();
  const [processedPostsForSession, setProcessedPostsForSession] = createSignal([])

  createEffect(() => {
    const classifierEntry = [props.classifiers].flat().find((classifierEntry: any) => classifierEntry?.id == props.category)
    let classifierForCategory = WinkClassifier()
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

  const handleKeyClick = (publicKey: string) => {
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
    props.setNostrPosts([])
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
    props.setNostrPosts([])
    props.putNostrKey(newNostrKey)
  }

  const applyPrediction = (post: any, classifierJSON: string) => {
    //const classifierEntry = classifiers.find((classifierEntry) => classifierEntry?.id == category)
    // if (classifierEntry == undefined || `${classifierEntry?.model}` == '') {
    //   return post
    // }
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
    winkClassifier.importJSON(classifierJSON)
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

  return (
    <div>
      <div>
        <Heading>
          <div>
            nostr
          </div>
        </Heading>
        <Show when={props.selectedNostrAuthor !== ''}>
        <div style={{'margin': '30px', 'display': 'flex', 'flex-direction': 'row', 'justify-content': 'space-around'}}>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            props.setNostrPosts([])
            handleKeyClick('')
          }}>
            <div color='orange'>
             {`${props.selectedNostrAuthor.substring(0,5)}...${props.selectedNostrAuthor.substring(props.selectedNostrAuthor.length - 5)}`}
            </div>
          </Link.Root>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            props.setNostrPosts([])
            handleFollow(props.selectedNostrAuthor)
            props.setSelectedNostrAuthor('')
          }}>
            <div color='green'>
            <CgUserAdd/>
            </div>
          </Link.Root>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            props.setNostrPosts([])
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
      </div>
        <For each={
          props.nostrPosts
          .filter((post: any) => post.mlText !== '')
          .filter((postItem: any) => {
            return Array.from(processedPostsForSession()).indexOf(postItem.mlText) == -1
          })
          .filter((postItem: any) => {
            const processedPostsForNostr = props.processedPosts.slice()
            .find((processedPostEntry: any) => processedPostEntry?.id === 'nostr')?.processedPosts.slice()
            if (processedPostsForNostr== undefined) {
              return true
            }
            return processedPostsForNostr.indexOf(postItem.mlText) == -1
          })
          .map((post: any) => applyPrediction(post, classifierJSON()))
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
                        <Show when={props.selectedNostrAuthor == ''}>
                          <Link.Root style={{'color': 'orange'}}onClick={(event) => {
                            event.preventDefault()
                            props.setNostrPosts([])
                            handleKeyClick(post.pubkey)
                          }}>
                            {`${post.pubkey.substring(0,5)}...${post.pubkey.substring(post.pubkey.length - 5)}`}
                          </Link.Root>
                        </Show>
                        <div style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</div>
                        <div>
                          {post.content}
                        </div>
                        <Collapsible.Trigger class="collapsible__trigger">
                        <PostTrain
                          category={() => 'nostr'}
                          classifierJSON={classifierJSON()}
                          mlText={post.mlText}
                          prediction={post.prediction}
                          docCount={post.docCount}
                          postId={post.id}
                          putProcessedPost={props.putProcessedPost}
                          putClassifier={props.putClassifier}
                          setProcessedPostsForSession={setProcessedPostsForSession}
                          processedPostsForSession={processedPostsForSession()}
                          setClassifier={setClassifier}
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
    </div>
  )
}
export default NostrPosts;