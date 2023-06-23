import { children } from 'solid-js'

const Main = (props) => {
  const c = children(() => props.children);
  return (
    <div
      class='maintransition'
      style={{
      'margin-left': `${props.isOpen() === true ? props.navBarWidth : 0}px`
    }}>
    <div class='main' style={{"margin-left": "10px"}}>
      {c()}
    </div>
  </div>
  )
}

export default Main;