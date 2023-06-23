import {
  For
} from 'solid-js';
import { BiSolidSortAlt } from 'solid-icons/bi'
import { FaSolidCheck } from 'solid-icons/fa'

import Heading from './Heading'

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'
import {
  Link,
  Switch,
  Combobox
} from "@kobalte/core";

import {
  VsTrash
} from 'solid-icons/vs'

import { Feed , Category} from './db-fixture'
const Feeds = (props: {
  feeds: Feed[],
  categories: Category[]
  // eslint-disable-next-line no-unused-vars
  putFeed: (feed: Feed) => void,
  // eslint-disable-next-line no-unused-vars
  removeFeed: (feed: Feed) => void
}) => {

  const group = createFormGroup({
    id: createFormControl(""),
    checked: createFormControl(true),
    categories: createFormControl([])
  });

  const onSubmit = async (event) => {
    event.preventDefault()
    if (group.isSubmitted) {
      console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        checked:true,
        categories:['']
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newFeed => {
      const newFeedObj: Feed = {
        ...{
          id: '',
          checked: true,
          categories: []
        },
        ...newFeed
      }
      props.putFeed(newFeedObj)
    })

    group.setValue({
      id:'',
      checked:true,
      categories:['']
    })
  };

  const handleKeyClick = (id: string) => {
    const valuesForSelectedFeed = props.feeds
      .find(feedEdit => feedEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        checked:true,
        categories: ['']
      }, valuesForSelectedFeed))
  }

  const handleToggleChecked = (id: string) => {
    const valuesForSelectedFeed = props.feeds
    .find(feed => feed['id'] === id)
    const newValueObj = (Object.assign(
      {
        ...valuesForSelectedFeed
      },
      {checked: !valuesForSelectedFeed.checked},
      {categories: valuesForSelectedFeed.categories.slice()}
    ))
    props.putFeed(newValueObj)
  }

  console.log(props.categories)

  return (
    <div>
      <div>
        <Heading>
          <div>{'Edit Feeds'}</div>
        </Heading>
      </div>
      <div class="text-field">
        <form onSubmit={onSubmit}>
          <label for="id">Feed URL</label>
          <TextInput name="id" control={group.controls.id} />
          <Combobox.Root
            name="categories"
            multiple
            options={props.categories.map(item => item.id)}
            // onInputChange={onInputChange}
            // onOpenChange={onOpenChange}
            placeholder="Search a category"
            itemComponent={props => (
              <Combobox.Item item={props.item}
                style={{
                  "outline-width": "3px",
                  "outline-color": "black",
                  "width": "300px",
                  "font-size": "large",
                  "display": "flex",
                  "flex-direction": "row",
                  "background-color": "lightgrey",
                  "justify-content": "flex-start",
                  "padding": "10px 10px 10px 10px"
                }}
              >
              <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
                <Combobox.ItemIndicator>
                  <FaSolidCheck />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            )}
          >
            <Combobox.HiddenSelect />
            <Combobox.Control aria-label="categories">
              <Combobox.Input />
              <Combobox.Trigger>
                <Combobox.Icon>
                  <BiSolidSortAlt />
                </Combobox.Icon>
              </Combobox.Trigger>
            </Combobox.Control>
            <Combobox.Portal>
              <Combobox.Content>
                <Combobox.Listbox />
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </form>
        <Switch.Root />
      </div>

      <div />
      <div>
        <h4 class="text-muted">Feeds</h4>
        <For each={props.feeds}>
          {(feed) => (
              <div style={
                {
                  'padding': '8px 8px 8px 32px',
                  'font-size': '25px',
                  'flex-direction': 'row'
                }
              }>
                <Link.Root onClick={(event) => {
                  event.preventDefault()
                  props.removeFeed(feed)
                }}>
                  <VsTrash/>
                </Link.Root>
                &nbsp;
                <Switch.Root
                  class="switch"
                  defaultChecked={feed.checked}
                  onClick={() => handleToggleChecked(feed.id)}
                >
                  <Switch.Input class="switch__input" />
                  <Switch.Control class="switch__control">
                    <Switch.Thumb class="switch__thumb" />
                  </Switch.Control>
                </Switch.Root>
                &nbsp;
                <Link.Root onClick={(event) => {
                  event.preventDefault()
                  handleKeyClick(feed.id)
                }}>
                  {feed.id || ''}
                </Link.Root>
              </div>
          )}
        </For>
      </div>
    </div>
  )
}
export default Feeds;