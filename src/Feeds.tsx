import {
  createFilter,
  Button,
  Switch,
  Combobox,
  Collapsible,
  Separator
} from "@kobalte/core";
import {
  For,
  createEffect,
  createSignal,
  Show
} from 'solid-js';
import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'
import { BiSolidSortAlt as CaretSortIcon } from 'solid-icons/bi'
import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import { ImCross as CrossIcon } from 'solid-icons/im'
import { VsAdd, VsTrash } from 'solid-icons/vs'
import { Feed , Category} from './db-fixture'
import Heading from './Heading'
const Feeds = (props: {
    feeds: Feed[],
    categories: Category[]
    // eslint-disable-next-line no-unused-vars
    putFeed: (feed: Feed) => void,
    // eslint-disable-next-line no-unused-vars
    removeFeed: (feed: Feed) => void
  }) => {
  const [categoryValues, setCategoryValues] = createSignal([]);
  const filter = createFilter({ sensitivity: "base" });
  const [options, setOptions] = createSignal<string[]>();
  const [ newFeed , setNewFeed ] = createSignal({});
  const onOpenChange = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptions(props.categories.map(category => category.id));
    }
  };
  const onInputChange = (value: string) => {
    setOptions(options.filter(option => filter.contains(option, value)));
  };
  const group = createFormGroup({
    id: createFormControl(""),
    checked: createFormControl(true),
    categories: createFormControl([])
  });

  const onSubmit = async (event: any) => {
    event.preventDefault()
    console.log(group.value)
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
      newFeedObj.categories = categoryValues()
      console.log(newFeedObj)
      props.putFeed(newFeedObj)
    })
    group.setValue({
      id:'',
      checked:true,
      categories: []
    })
    setCategoryValues([])
  };

  const handleToggleChecked = (id: string) => {
    const valuesForSelectedFeed = props.feeds
    .find(feed => feed['id'] === id)
    const newValueObj = (Object.assign(
      {
        ...valuesForSelectedFeed
      },
      {checked: !valuesForSelectedFeed?.checked}
    ))
    // props.putFeed(newValueObj)
    setNewFeed(newValueObj)
  }

  createEffect(() => {
    const theNewFeed = Object.assign({
      id:'',
      checked:true,
      categories: []
    }, newFeed())
    props.putFeed(theNewFeed)
  })

  const handleKeyClick = (id: string) => {
    const valuesForSelectedFeed = props.feeds
      .find(feedEdit => feedEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        checked:true
      }, valuesForSelectedFeed))
    setCategoryValues(valuesForSelectedFeed?.categories)
  }

  return (
    <>
      <div>
        <Heading>
          <div>{'Edit Feeds'}</div>
        </Heading>
      </div>
      <Combobox.Root<string>
        multiple
        options={props.categories.map(category => category.id)}
        value={categoryValues()}
        onChange={setCategoryValues}
        onInputChange={onInputChange}
        onOpenChange={onOpenChange}
        placeholder="Search some fruits…"
        itemComponent={props => (
          <Combobox.Item item={props.item}>
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            <Combobox.ItemIndicator>
              <CheckIcon />
            </Combobox.ItemIndicator>
          </Combobox.Item>
        )}
      >

  <form onSubmit={onSubmit}>
    <label for="id">Feed URL</label>
    <TextInput name="id" control={group.controls.id} />
    <div>
      <Button.Root onClick={(event) => {
        event.preventDefault()
        onSubmit(event)
      }}>
     <VsAdd />
    </Button.Root>
    <Button.Root onClick={(event) => {
        event.preventDefault()
        onSubmit(event)
      }}>Submit</Button.Root>
    </div>
    </form>
        <Combobox.Control<string> aria-label="Fruits">
          {state => (
            <>
              <div>
                <For each={state.selectedOptions()}>
                  {option => (
                    <span onPointerDown={e => e.stopPropagation()}>
                      {option}
                      <button onClick={() => state.remove(option)}>
                        <div style={{'color': 'red'}}><CrossIcon /></div>
                      </button>
                    </span>
                  )}
                </For>
                <Combobox.Input />
              </div>
              <button onPointerDown={e => e.stopPropagation()} onClick={state.clear}>
              <div style={{'color': 'red'}}><CrossIcon /></div>
              </button>
              <Combobox.Trigger>
                <Combobox.Icon>
                  <CaretSortIcon />
                </Combobox.Icon>
              </Combobox.Trigger>
            </>
          )}
        </Combobox.Control>
        <Combobox.Portal>
          <Combobox.Content>
            <Combobox.Listbox style={{'background-color': 'white'}}/>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>
      <p>feed categories: {categoryValues().join(", ")}.</p>
      <Separator.Root />
      <strong style={{'font-size': 'large'}}>feeds:</strong>
      <For each={props.feeds}>
          {(feed) => (
            <Show when={feed.id != ''}>
              <Collapsible.Root class="collapsible" defaultOpen={true}>
                <Collapsible.Content class="collapsible__content">
                    <Collapsible.Trigger class="collapsible__trigger">
                      <Button.Root onClick={() => {setTimeout(() => props.removeFeed(feed), 300)}}>
                        <VsTrash/>
                      </Button.Root>
                     </Collapsible.Trigger>
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
                    <Button.Root onClick={() => handleKeyClick(feed.id)}>
                      {feed.id || ''}
                    </Button.Root>
                </Collapsible.Content>
              </Collapsible.Root>
            </Show>
          )}
        </For>
    </>
  );
}

export default Feeds

// const Feeds = (props: {
//   feeds: Feed[],
//   categories: Category[]
//   // eslint-disable-next-line no-unused-vars
//   putFeed: (feed: Feed) => void,
//   // eslint-disable-next-line no-unused-vars
//   removeFeed: (feed: Feed) => void
// }) => {
//   const [newFeed, setNewFeed] = createSignal();
//   // const [feedCategories, setFeedCategories] = createSignal([]);

//   const onCategoriesInputChange = (value: string) => {
//     console.log('*******')
//     console.log(value)
//     // const valuesForSelectedFeed = props.feeds
//     // .find(feed => feed['id'] === id)

//     // const newValueObj = (Object.assign(
//     //   {
//     //     ...valuesForSelectedFeed
//     //   },
//     //   {categories: valuesForSelectedFeed.categories.slice()}
//     // ))
//     // props.putFeed(newValueObj)
//     // setNewFeed(newValueObj)

//     // console.log(value)
//     //setOptions(ALL_OPTIONS.filter(option => filter.contains(option, value)));
//   };