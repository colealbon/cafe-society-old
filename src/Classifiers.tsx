import {
  For
} from 'solid-js';
import { Collapsible } from "@kobalte/core";
import { Link } from "@kobalte/core";

import Heading from './Heading'

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'

import {
  VsAdd,
  VsTrash,
  VsCopy
} from 'solid-icons/vs'
import { Classifier } from './db-fixture'
const Classifiers = (props: {
  classifiers: Classifier[],
  // eslint-disable-next-line no-unused-vars
  putClassifier: (classifier: Classifier) => void,
  // eslint-disable-next-line no-unused-vars
  removeClassifier: (classifier: Classifier) => void
}) => {

  const group = createFormGroup({
    id: createFormControl(""),
    model: createFormControl(""),
    thresholdSuppressOdds: createFormControl('')
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
        model:'',
        thresholdSuppressOdds: ''
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newClassifier => {
      const newClassifierObj: Classifier = {
        ...{
          id: '',
          model: '',
          thresholdSuppressOdds: ''
        },
        ...newClassifier
      }
      props.putClassifier(newClassifierObj)
    })

    group.setValue({
      id:'',
      model:'',
      thresholdSuppressOdds: ''
    })
  };

  const handleAddClick = (event) => {
    event.preventDefault()
    onSubmit(event)
    group.setValue({
      id:'',
      model: '',
      thresholdSuppressOdds: ''
    })
  }

  const handleKeyClick = (id: string) => {
    const valuesForSelectedClassifier = props.classifiers
      .find(classifierEdit => classifierEdit['id'] === id)
    const newClassifier: any = {
      id: `${valuesForSelectedClassifier?.id}`,
      model: `${valuesForSelectedClassifier?.model}`,
      thresholdSuppressOdds: `${valuesForSelectedClassifier?.thresholdSuppressOdds}`
    }
    group.setValue(newClassifier)
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(group.controls.model.rawValue);
  }

  const handleRemoveClick = (classifier) => {
    event.preventDefault()
    props.removeClassifier(classifier)
  }

  return (
  <div class='fade-in'>
    <div>
      <Heading>
        <div>{'Edit Classifiers'}</div>
      </Heading>
    </div>
    <form onSubmit={onSubmit}>
      <label for="id">label</label>
      <TextInput name="id" control={group.controls.id} />
      <div />
      <label for="thresholdSuppressOdds">Threshold Suppress Odds</label>
      <TextInput name="thresholdSuppressOdds" control={group.controls.thresholdSuppressOdds} />
      <div />
      <label for="Model">Bayes Model</label>
      <TextInput name="model" control={group.controls.model} />
      <div>
        <Link.Root onClick={handleAddClick}>
          <VsAdd />
        </Link.Root>
      </div>
    </form>
    <Collapsible.Root class="collapsible" defaultOpen={false}>
    <Collapsible.Trigger class="collapsible__trigger">
      <div>JSON</div>
    </Collapsible.Trigger>
    <Collapsible.Content class="collapsible__content">
      <p class="collapsible__content-text">
      {<>
        <div>
        <Link.Root onClick={handleCopyClick}>
          <VsCopy />
        </Link.Root>
      </div>
      <div style={{'max-width': '500px'}}>
        <pre>{JSON.stringify(group.controls.model.rawValue, null, 2)}</pre>
      </div>
    </>}
    </p>
    </Collapsible.Content>
    </Collapsible.Root>
  <div>
  <h4 class="text-muted">Classifiers</h4>
  <For each={props.classifiers}>
    {(classifier) => (
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
        <Link.Root onClick={() => {
          event.preventDefault()
          handleRemoveClick(classifier)
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
          handleKeyClick(classifier.id)
        }}>
          {classifier.id || ''}
        </Link.Root>
      </div>
      </div>
    )}
  </For>
  </div>
  </div>
  )
}
export default Classifiers;
