import { children } from 'solid-js'

const Main = (props) => {
  const c = children(() => props.children);
  return (
    <div
      class='fade-in'
      style={{
        'margin-left': `${props.isOpen() === true ? props.navBarWidth : 0}px`
      }}>
    <div class="transition duration-300 ease-in-out mr-10 ml-10 flex flex-col">
      {c()}
      </div>
  </div>
  )
}

export default Main;