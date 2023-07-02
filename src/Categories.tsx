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
  VsAdd,
  VsTrash
} from 'solid-icons/vs'
import { Category } from './db-fixture'
const Categories = (props: {
  categories: Category[],
  // eslint-disable-next-line no-unused-vars
  putCategory: (category: Category) => void,
  // eslint-disable-next-line no-unused-vars
  removeCategory: (category: Category) => void
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
    .forEach(newCategory => {
      const newCategoryObj: Category = {
        ...{
          id: '',
          checked: true
        },
        ...newCategory
      }
      props.putCategory(newCategoryObj)
    })

    group.setValue({
      id:'',
      checked:true
    })
  };

  const handleKeyClick = (id: string) => {
    const valuesForSelectedCategory = props.categories
      .find(categoryEdit => categoryEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        checked:true
      }, valuesForSelectedCategory))
  }

  const handleToggleChecked = (id: string) => {

    const valuesForSelectedCategory = props.categories
    .find(categoryEdit => categoryEdit['id'] === id)

    if (valuesForSelectedCategory?.id == undefined) {
      return
    }

    const newValueObj = {
        ...valuesForSelectedCategory
      ,
      checked: !group.value.checked
    }

    group.setValue(newValueObj)
    props.putCategory(newValueObj)
  }

  // const handleEraseClick = () => {
  //   group.setValue({
  //       id:'',
  //       checked:true
  //     })
  // }

  return (
  <div class='fade-in'>
    <div>
      <Heading>
        <div>{'Edit Categories'}</div>
      </Heading>
    </div>
    <form onSubmit={onSubmit}>
      <label for="id">category</label>
      <TextInput name="id" control={group.controls.id} />
      <div />
      <Switch.Root
        checked={group.value.checked}
        name="checked"
        onChange={() => handleToggleChecked(`${group.value.id}`)}
      />
      <div>
        <Link.Root onClick={(event) => {
          event.preventDefault()
          onSubmit(event)
        }}>
          <VsAdd />
        </Link.Root>
      </div>
    </form>
  <div>
  <h4 class="text-muted">Categories</h4>
  <For each={props.categories}>
    {(category) => (
      <div style={{
        'width': '100%',
        'display': 'flex',
        'flex-direction': 'row',
        'justify-content': 'flex-start',
        'font-size': '25px',
      }}>
        <div style={
          {
            'padding': '8px 8px 8px 32px',
            'text-decoration': 'none',
            'font-size': '25px',
            'color': '#818181',
            'display': 'block',
            'transition':'0.3s'
          }}>
        <Link.Root onClick={(event) => {
            event.preventDefault()
            props.removeCategory(category)
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
        <Link.Root onClick={(event) => {
          event.preventDefault()
          handleKeyClick(category.id)
        }}>
          {category.id || ''}
        </Link.Root>
      </div>
      </div>
    )}
  </For>
  </div>
  </div>
  )
}
export default Categories;
