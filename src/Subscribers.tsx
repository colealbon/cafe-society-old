import { For } from 'solid-js'
import { Link } from '@kobalte/core'

const Subscribers = (props: {
  albyIncomingInvoices: any,
  nostrKeys: any,
  encryptAndPublish: any
}) => {
  return (
    <div>
      <div>
        <ul>
          <li><Link.Root href="https://github.com/colealbon/cafe-society/blob/7912ea21fa6474049cbe3b507ad47ba90827396d/src/App.tsx#L400">subscribers</Link.Root> receive a private nostr message containing a new version of the ML model when it is published</li>
          <li>add a subscriber: send sats to the logged in Alby lightning address with an npub nostr address in the comment. </li>
          <li>The public key for that npub will appear below</li>
        </ul>
       </div>
       <div style={{'font-size':'large'}}>
        subscribers (raw nostr public keys)
        </div>
      <For each={props.albyIncomingInvoices()}>{
        (pubkey) => {
          return (
            <Link.Root onClick={() => props.encryptAndPublish(
              {
                'theirPublicKey': pubkey
              })}>
              {pubkey}
            </Link.Root>
          )
        }
      }
      </For>
    </div>
  )
}
export default Subscribers;