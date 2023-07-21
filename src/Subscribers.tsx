// import crypto from 'crypto'
// import * as secp from '@noble/secp256k1'

const Subscribers = (props: {
  albyIncomingInvoices: any
}) => {

  // const encryptAndPublish = (params: {
  //     theirPublicKey: string
  //   }) {

  //   // let sharedPoint = secp.getSharedSecret(ourPrivateKey, '02' + theirPublicKey)
  //   // let sharedX = sharedPoint.slice(1, 33)

  //   // let iv = crypto.randomFillSync(new Uint8Array(16))
  //   // var cipher = crypto.createCipheriv(
  //   //   'aes-256-cbc',
  //   //   Buffer.from(sharedX),
  //   //   iv
  //   // )
  //   // let encryptedMessage = cipher.update(text, 'utf8', 'base64')
  //   // encryptedMessage += cipher.final('base64')
  //   // let ivBase64 = Buffer.from(iv.buffer).toString('base64')

  //   // let event = {
  //   //   pubkey: ourPubKey,
  //   //   created_at: Math.floor(Date.now() / 1000),
  //   //   kind: 4,
  //   //   tags: [['p', theirPublicKey]],
  //   //   content: encryptedMessage + '?iv=' + ivBase64
  //   // }
  // }

  return (
    <div>
      <div style={{'font-size':'large'}}>
        subscribers
        </div>
        <div>
        <ul>
          <li>subscribers receive a private nostr message containing a new version of the ML model when it is published</li>
          <li>add a subscriber: send sats to the logged in Alby lightning address with an npub nostr address in the comment. </li>
          <li>The public key for that npub will appear below</li>
        </ul>
       </div>
      <pre>{JSON.stringify(props.albyIncomingInvoices(), null, 2)}</pre>
    </div>
  )
}
export default Subscribers;