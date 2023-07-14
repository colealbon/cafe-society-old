import {
  For
} from 'solid-js';

import {
  Button
} from "@kobalte/core";

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

  const onSubmit = async (event: any) => {
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

  const handleToggleChecked = (id: string) => {
    const valuesForSelectedFeed = props.nostrRelays
    .find(nostrRelayEdit => nostrRelayEdit['id'] === id)
    const newValueObj = (Object.assign(
      {id: ''},
      {
        ...valuesForSelectedFeed
      },
      {checked: !group.value.checked}
    ))
    group.setValue (newValueObj)
    props.putNostrRelay(newValueObj)
  }

  return (
    <div class='fade-in'>
      <Heading>
        <div>{'Edit Nostr Relays'}</div>
      </Heading>
<div>
  <form onSubmit={onSubmit}>
    <div />
    <label for="id">URL</label>
    <TextInput name="id" control={group.controls.id} />
    <div />
  </form>
</div>
<div>
  <h4 class="text-muted">NostrRelays</h4>
  <For each={props.nostrRelays}>
    {(nostrRelay) => (
      <div style={{'display': 'flex', 'flex-direction': 'row'}}>
        <Switch.Root
          class="switch"
          checked={nostrRelay.checked}
          onChange={handleToggleChecked(`${nostrRelay.id}`)}
        >
          <Switch.Input class="switch__input" />
          <Switch.Control class="switch__control">
            <Switch.Thumb class="switch__thumb" />
          </Switch.Control>
          <Button.Root onClick={() => {
            props.removeNostrRelay(nostrRelay)
          }}>
            <VsTrash />
          </Button.Root>
          <Switch.Label>{`${nostrRelay.id}`}</Switch.Label>
        </Switch.Root>

      </div>
    )}
  </For>
</div>
</div>
  )
}
export default NostrRelays;
