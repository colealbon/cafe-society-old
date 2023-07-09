import WinkClassifier from 'wink-naive-bayes-text-classifier';
import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'
import { Link } from "@kobalte/core";
import { Tooltip } from "@kobalte/core";
import {
  AiOutlineArrowUp,
  AiOutlineArrowDown
} from 'solid-icons/ai'

const PostTrain = (props: any) => {
  const handleTrain = (mlClass: string) => {
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
    try {
      if (`${props.classifierJSON}` != '')  {
        winkClassifier.importJSON(props.classifierJSON)
      }
    } catch (error) {
      console.log(error)
      console.log(props.classifierJSON)
    }
    const nlp = winkNLP( model );
    const its = nlp.its;

    winkClassifier.learn(props.mlText, mlClass)
    const classifierEntry = {
        id: props.category(),
        model: winkClassifier.exportJSON()
        }
    props.setClassifier(winkClassifier)
    props.putClassifier(classifierEntry)
  }

  const handleComplete = () => {
    const theProcessedPostsID = props.postId
    const theProcessedPosts = props.processedPosts
    const processedPostsForFeedEntry = theProcessedPosts?.find((processedPostsEntry) => {
      return processedPostsEntry.id === theProcessedPostsID
    })
    const processedPostsForFeed = processedPostsForFeedEntry?.processedPosts?.slice()
    if (processedPostsForFeed == undefined) {
      let newEntry = {}
      newEntry['id'] = theProcessedPostsID
      newEntry['processedPosts'] = [`${props.mlText}`]
      props.putProcessedPost(newEntry)
    } else {
      let newEntry = {}
      newEntry['id'] = theProcessedPostsID
      newEntry['processedPosts'] = Array.from(new Set([...processedPostsForFeed, ...[`${props.mlText}`]]))
      props.putProcessedPost(newEntry)
    }
    props.setProcessedPostsForSession(Array.from(new Set([...props.processedPostsForSession, ...[`${props.mlText}`]])))
  }

  // const denominator = props.prediction?.reduce((accumulator: number, currentValue: number) => {
  // return accumulator + currentValue[1]
  // }, 100.0)

  let promoteNumerator = 0.0
  let suppressNumerator = 0.0

  if (!props.prediction?.find((predictionEntry) => predictionEntry[0] == 'unknown')) {
    promoteNumerator = 0.0 + props.prediction?.find((predictionEntry) => predictionEntry[0] == 'promote')[1]
    suppressNumerator = 0.0 + props.prediction?.find((predictionEntry) => predictionEntry[0]  == 'suppress')[1]
  }
  return(
    <div style={{"display": "flex", "flex-direction": 'row', 'justify-content':'space-around', 'width': '300px'}}>
    <div>{suppressNumerator.toFixed(2).replace('NaN', '-')}</div>
    <AiOutlineArrowDown class="collapsible__trigger-icon button" onclick={() => setTimeout(() => {
        handleComplete()
        handleTrain('suppress')
        }, 300)
      }/>
    <Tooltip.Root>
      <Tooltip.Trigger  style={{'padding': 'unset'}}>
        <Link.Root onClick={() => setTimeout(() => handleComplete(), 300)}>{props.category()}</Link.Root>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="tooltip__content">
          <div>
          <div>
          {props.docCount ? `ML document count: ${props.docCount}` : 'more training required for predictions'}
          </div>
          <div>
            {props.mlText}
          </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
      <AiOutlineArrowUp
        class="collapsible__trigger-icon"
        onclick={() => setTimeout(() => {
            handleComplete()
            handleTrain('promote')
          }, 300)
      }/>
      <div>{promoteNumerator.toFixed(2).replace('NaN', '-')}</div>
      <div/>
      <div/>
    </div>
  )
}
export default PostTrain