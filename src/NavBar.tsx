import {
  For,
  Accessor
} from 'solid-js';
import {
  Link
} from "@kobalte/core";
import {
  TrainLabel
} from "./db-fixture";

const NavBar = (props: {
  navBarWidth: number;
  isOpen: Accessor<boolean>;
  setClose: any;
  setSelectedTrainLabel: any;
  trainLabels: TrainLabel[];
}) => {
  return (
  <>
    <div
      class='sidenav'
      style={{
        display:'flex', "flex-direction": 'column',
        width: `${props.isOpen() === true ? props.navBarWidth : 0}px`
      }}
    >
      <Link.Root style={{color:'white'}} onClick={props.setClose}>
      ⭠
      </Link.Root>
      <div />
      <Link.Root href="/posts" onClick={() => props.setSelectedTrainLabel('')}
      >Posts</Link.Root>
      <div style={{margin: "10px"}}>
          <For each={props.trainLabels}>
            {
              (category) => (
                <Link.Root
                  onClick={() => {
                    console.log(category.id)
                    props.setSelectedTrainLabel(category.id)
                  }}
                  href={`/posts/${category.id}`}
                >
              {`${category.id}`}
              </Link.Root>
              )
            }
          </For>
          <Link.Root
            onClick={() => props.setSelectedTrainLabel('nostr')}
            href="/nostrposts"
          >
            nostr
          </Link.Root>
      </div>
      <Link.Root href="/nostr">Nostr Keys</Link.Root>
      <Link.Root href="/feeds">Feeds</Link.Root>
      <Link.Root href="/contribute">Contribute</Link.Root>
      <Link.Root href="/cors">Cors Proxies</Link.Root>
      <Link.Root href="/nostrrelays">Nostr Relays</Link.Root>
      <Link.Root href="/trainlabels">Train Labels</Link.Root>
      <Link.Root href="/classifiers">Classifiers</Link.Root>
    </div>
    </>
  )
}
export default NavBar;