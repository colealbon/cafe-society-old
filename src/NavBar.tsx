
import { For } from "solid-js"
import { Link } from "@kobalte/core";
import { AiOutlineArrowLeft } from 'solid-icons/ai'

const NavBar = (props) => {
  return (
  <>
    <div
      class='sidenav'
      style={{
        display:'flex', "flex-direction": 'column',
        width: `${props.isOpen() === true ? props.navBarWidth : 0}px`
      }}
    >
      <Link.Root onClick={props.handleClose}>
        <AiOutlineArrowLeft />
      </Link.Root>
      <div />
      <Link.Root href="/posts" onClick={() => props.setSelectedCategory('')}>Posts</Link.Root>
      <div style={{margin: "10px"}}>
          <For each={props.categories}>
          {
          (category) => (
              <Link.Root
              onClick={() => props.setSelectedCategory(`${category.id}`)}
              href={`/posts/${category.id}`}
          >
          {`${category.id}`}
          </Link.Root>
          )
          }
          </For>
          <Link.Root
            onClick={() => props.setSelectedCategory('nostr')}
            href="/nostrposts">nostr</Link.Root
          >
      </div>
      <Link.Root href="/nostr">Nostr Keys</Link.Root>
      <Link.Root href="/feeds">Feeds</Link.Root>
      <Link.Root href="/contribute">Contribute</Link.Root>
      <Link.Root href="/cors">Cors Proxies</Link.Root>
      <Link.Root href="/nostrrelays">Nostr Relays</Link.Root>
      <Link.Root href="/categories">Categories</Link.Root>
      <Link.Root href="/classifiers">Classifiers</Link.Root>
    </div>
    </>
  )
}
export default NavBar;