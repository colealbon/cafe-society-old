import { Link } from "@kobalte/core";
import { Tooltip } from "@kobalte/core";
import {
    AiOutlineArrowUp,
    AiOutlineArrowDown
  } from 'solid-icons/ai'

const PostTrain = (props: any) => {
  const handleTrain = (mlClass: string) => {
    props.classifier().learn(props.mlText, mlClass)
    const classifierEntry = {
        id: props.category(),
        model: props.classifier().exportJSON()
        }
    console.log(props.classifierEntry)
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

  const denominator = props.prediction.reduce((accumulator: number, currentValue: number) => {
  return accumulator + currentValue[1]
  }, 0.0)

  const promoteNumerator = 0.0 + props.prediction.find((predictionEntry) => predictionEntry[0] == 'promote')[1]
  const suppressNumerator = 0.0 + props.prediction.find((predictionEntry) => predictionEntry[0]  == 'suppress')[1]

  return(
    <div style={{"display": "flex", "flex-direction": 'row', 'justify-content':'space-around', 'width': '300px'}}>
    <div>{Math.round((suppressNumerator / denominator) * 100)?.toString().replace('NaN',' - ')}%</div>
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
          {`ML document count: ${Object.assign(props.classifier()).docs.length}`}
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
      <div>{Math.round((promoteNumerator / denominator) * 100)?.toString().replace('NaN',' - ')}%</div>
      <div/>
      <div/>
    </div>
  )
}
export default PostTrain