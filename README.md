## the good

nostr is a censorship resistant platform where journalists and whistleblowers can find a last resort channel to publish. For the purpose of this discussion let us say that the whistleblower message is the pure signal and might just be the primary goal of the nostr community.

## the bad  

nostr is a free for all where anything goes. Ugly people can post images of their junk, robots can incessantly drip their core temperature, and teams of robot meme posters can publicly circle zapathon each other with the result of jamming an otherwise pure signal.

## the ugly

For some people in the nostr community, ugly people's junk _is_ the pure signal. We cannot expect that relay operators, even those with the best intentions, can act as steward of the signal because the definition of pure is different for each and every user. Further, users may have more than one definition depending on context. They may wish to discuss only technical hardware specs while at work or during business hours, but then switch to macro economics during the weekend, and of course always block ugly people's junk.

## the solution

(well a part of one solution) cafe-society.news exposes the tools for censorship to the individual level. Even further than that, users can define categories and apply different filters to the same channel at their discretion. Filters come in the form of mute lists that stay on device as well as machine learning models that also stay on device and can be shared in the community like business cards.

## the state of the art

cafe-society.news currently only runs on duckduckgo and safari browsers. The UI is 50% complete and often broken. Decisions need to be made whether to continue as text only, and we have no money to do anything. Nevertheless, we'll continue to build and improve and solicit collaborators (even relay collaborators) until we become a valued even essential part of the community.

## a message love

A wet pile of dregs can smell pretty bad, but if you pick out the putrid stuff and expose it to the sun the dregs will smell like flowers!

## todo

30402 event kind to advertise trained models?
Data Vending Machines NIP (kind 68001) which replies with the transcript (kind 68002)
move processed posts from fetcher parameter to postsReport
move classifier from fetcher parameter to posts report
move ignore from fetcherParameter to posts report

## business/incentives (mpex/trilema inspired subscription model)

cafe-society.news will offer ability to assemble, advertise and pay for subscriptions to updated models via nostr messages.

### draft

trainer will generate/configure a public key for each model they use.  Each classifier/model in the settings will have at least one of classifier json, keypair, or public key.  Until we determine otherwise, different models can use the same key.

### Flow Control

- if the classifier has only a public key, the sofware will know to fetch and decrypt the model along with nostrposts.

- If the classifier has a private key, software will periodically encrypt and post the ML model to noster during/after a training session.  

- if the classifier has no keys affiliated, then local storage is used and copy paste is still a message medium.

### Purchases:
reader/subscriber sends zaps to trainer with the reader/consumer public key in a memo  

periodically the trainer will encrypt new model to the subscribers and post encrypted model to nostr.  

reader/subscriber will fetch new models on nostr as they fetch their other posts.

### Sales,Classifieds/Discovery:
models be posted to (probably 30402) event for classifieds along with the results of wink stats() and an address that is monitored for subscription payments.  

It may also be a good idea to offer a live service to reply with wink metrics for some sample text. This will help the reader find out if the classifier is relevant before spending money.

wtf is wink stats()?
https://winkjs.org/wink-naive-bayes-text-classifier/NaiveBayesTextClassifier.html#metrics


User Story for business model:

Actors:  

reader address is set up to receive model updates via nostr private messages and use that model for filtering.  
npub1cafega8qnkv60rw65fe5tunzn3ugxeeqttqlcmsjcgl7qjtkduzqg90tyg  
log into https://hamstr.to/home to see private messages  

trainer address contains incoming invoices with a memo (the readers address).  After a training session, the trainer publishes updates to the reader address via private nostr messages.
log into https://cafe-society.news to train and publish

market address  
- classifieds page:  
npub1cafejl3mpqwpdq5gysalv8f4kg8p5ezs9fpste9xkvava8lzptwqpc6fut  
cafe@getalby.com  

Steps:  
- somebody needs to send alby lightning sats to the trainer address with a memo of the reader address
- train trains, at the end of session, looks at trainer's invoices and sends a private message containing the new model to all the invoice memos.
- reader can navigate to https://hamstr.to/home to see private messages.

Sustanability:  
- for trainers who wish to advertise a model on cafe-society.news, they send zaps to market address, with the ad in the memo field. Probably the memo will point to a web page or nostr message with details.