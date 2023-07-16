import { Link } from "@kobalte/core";
import { Tooltip } from "@kobalte/core";
import {
  AiOutlineArrowUp,
  AiOutlineArrowDown
} from 'solid-icons/ai'

const PostTrain = (props: {
  mlText: string,
  trainLabel: string,
  prediction: any,
  docCount: number,
  markComplete: () => any,
  // eslint-disable-next-line no-unused-vars
  train: (mlClass: string) => any
}) => {
  // const handleComplete = () => props.markComplete( )
  const handleTrain = (mlClass: string) => {
    props.train(mlClass)
  }

  let promoteOdds = 0.0
  let suppressOdds = 0.0

  try {
    if (![props.prediction]?.find((predictionEntry: any) => predictionEntry[0] == 'unknown')) {
      promoteOdds = 0.0 + props.prediction?.find((predictionEntry: any) => predictionEntry[0] == 'promote')[1]
      suppressOdds = 0.0 + props.prediction?.find((predictionEntry: any) => predictionEntry[0]  == 'suppress')[1]
    }
  } catch (error) {
    if (error == undefined) {
      console.log('unreachable -> probably not trained enough at this point and new users would get flooded with logs if we write out the error here')
    }
  }

  return(
    <div style={{"display": "flex", "flex-direction": 'row', 'justify-content':'space-around', 'width': '300px'}}>
    <div>{suppressOdds.toFixed(2).replace('NaN', '-')}</div>
    <AiOutlineArrowDown class="collapsible__trigger-icon button" onclick={() => setTimeout(() => {
        props.markComplete()
        handleTrain('suppress')
        }, 300)
      }/>
    <Tooltip.Root>
      <Tooltip.Trigger  style={{'padding': 'unset'}}>
        <Link.Root onClick={() => setTimeout(() => props.markComplete() , 300)}>{props.trainLabel}</Link.Root>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="tooltip__content">
          <div>
          <div>
          {props.docCount ? `ML document count: ${props.docCount}` : `more training required for predictions ${JSON.stringify(props.prediction, null, 2)}`}
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
            props.markComplete()
            handleTrain('promote')
          }, 300)
      }/>
      <div>{promoteOdds.toFixed(2).replace('NaN', '-')}</div>
      <div/>
      <div/>
    </div>
  )
}
export default PostTrain