import type { Component } from 'solid-js';
import Heading from './Heading'
import { Separator } from "@kobalte/core";

const Contribute: Component = () => {
  return (
    <div class='fade-in'>
      <Heading>Contribute</Heading>
      <div>
        <div>
          lightning: <a href="https://getalby.com/p/cafe">cafe@getalby.com</a>
        </div>
        <div>
          github: <a href="https://github.com/colealbon/cafe-society.news">https://github.com/colealbon/cafe-society.news</a>
        </div>
      </div>
      <Separator.Root class="separator" />
      <div style={{'display': 'flex', "justify-content": "space-evenly"}}><strong>pending</strong><div/><div/></div>
        <ul>
          <li>mark all user posts complete when user is ignored</li>
          <li>user configurable fetch limit</li>
          <li>toggle relays (to troubleshoot speed)</li>
          <li>display user name instead of raw public key</li>
          <li>buttons need styling</li>
          <li>train all unprocessed posts</li>
        </ul>
        <div style={{'display': 'flex', "justify-content": "space-evenly"}}><strong>in flight</strong><div/><div/></div>
        <ul>
        <li>display count of unprocessed posts</li>
        </ul>
        <div style={{'display': 'flex', "justify-content": "space-evenly"}}><strong>complete</strong><div/><div/></div>
        <ul>
          <li><del>click on category should add post to processed (skip training)</del></li>
          <li><del>add nostr global feed</del></li>
          <li><del>replace bayes library with natural.js</del></li>
          <li><del>replace react with solidjs</del></li>
          <li><del>replace material ui with kobalte</del></li>
        </ul>
    </div>
  )
}
export default Contribute;