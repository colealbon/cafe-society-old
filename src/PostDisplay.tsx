import {
  Component
} from 'solid-js';

const PostDisplay: Component = (props: {
  postTitle: string;
  postSummary: string;
  postId: string;
}) => {
  return(
    <div>
      <h2 style={{color:'blue'}}>
        <a target="cafe" rel="noreferrer noopener" href={props.postId}>{
          props.postTitle
        }</a>
      </h2>
      <div>
        {props.postSummary}
      </div>
  </div>
  )
}
export default PostDisplay