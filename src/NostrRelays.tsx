import {
  For
} from 'solid-js';

import { Link } from "@kobalte/core";

import Heading from './Heading'

import { Switch } from "@kobalte/core";

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'

import {
  VsTrash
} from 'solid-icons/vs'

import { NostrRelay } from './db-fixture'
const NostrRelays = (props: {
  nostrRelays: NostrRelay[],
  // eslint-disable-next-line no-unused-vars
  putNostrRelay: (nostrRelay: NostrRelay) => void,
  // eslint-disable-next-line no-unused-vars
  removeNostrRelay: (nostrRelay: NostrRelay) => void
}) => {

  const group = createFormGroup({
    id: createFormControl(""),
    checked: createFormControl(true)
  });

  const onSubmit = async (event) => {
    event.preventDefault()
    if (group.isSubmitted) {
      // console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        checked:true
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newNostrRelay => {
      const newNostrRelayObj: NostrRelay = {
        ...{
          id: '',
          checked: true
        },
        ...newNostrRelay
      }
      props.putNostrRelay(newNostrRelayObj)
    })

    group.setValue({
      id:'',
      checked:true
    })
  };

  const handleKeyClick = (id: string) => {
    const valuesForSelectedFeed = props.nostrRelays
      .find(nostrRelayEdit => nostrRelayEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        checked:true
      }, valuesForSelectedFeed))
  }

  const handleToggleChecked = (id: string) => {
    const valuesForSelectedFeed = props.nostrRelays
    .find(nostrRelayEdit => nostrRelayEdit['id'] === id)
    const newValueObj = (Object.assign(
      {
        ...valuesForSelectedFeed
      },
      {checked: !group.value.checked}
    ))

    group.setValue (newValueObj)
    props.putNostrRelay(newValueObj)
  }

  // const handleEraseClick = () => {
  //   group.setValue({
  //       id:'',
  //       checked:true
  //     })
  // }

  return (
    <div class='fade-in'>
      <Heading>
        <div>{'Edit Nostr Relays'}</div>
      </Heading>
<div>
  <form onSubmit={onSubmit}>
    <label for="id">URL</label>
    <TextInput name="id" control={group.controls.id} />
    <div />
    <Switch.Root
      checked={group.value.checked}
      name="checked"
      onChange={() => {
        handleToggleChecked(group.value.id)
      }}
    />
  </form>
</div>
<div>
  <h4 class="text-muted">NostrRelays</h4>
  <For each={props.nostrRelays}>
    {(nostrRelay) => (
      <div style={{
        'width': '100%',
        'display': 'flex',
        'flex-direction': 'row',
        'justify-content': 'flex-start',
        'font-size': '25px',
      }}>
      <div style={{
        'padding': '8px 8px 8px 32px',
        'text-decoration': 'none',
        'font-size': '25px',
        'color': '#818181',
        'display': 'block',
        'transition':'0.3s'
      }}>
        <Link.Root onClick={(event) => {
            event.preventDefault()
            props.removeNostrRelay(nostrRelay)
          }}>
            <VsTrash />
          </Link.Root>
      </div>
      <div style={
        {
          'padding': '8px 8px 8px 32px',
          'text-decoration': 'none',
          'font-size': '25px',
          'color': '#818181',
          'display': 'block',
          'transition':'0.3s'
        }}>
          <Link.Root
            // eslint-disable-next-line solid/reactivity
            onClick={() => {
              event.preventDefault()
              handleKeyClick(nostrRelay.id)
            }}
          >
            {nostrRelay.id}
          </Link.Root>
        </div>
      </div>
    )}
  </For>
</div>
</div>
  )
}
export default NostrRelays;
