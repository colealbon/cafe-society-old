
import { Combobox, createFilter } from "@kobalte/core";
import {HiSolidX} from 'solid-icons/hi'
import { BiSolidSortAlt } from 'solid-icons/bi'
import { FaSolidCheck } from 'solid-icons/fa'

//import { CaretSortIcon, CheckIcon } from "some-icon-library";

import { createSignal, For } from "solid-js";
const ALL_OPTIONS = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"];

function ComboboxMulti() {
  const [values, setValues] = createSignal(["Blueberry", "Grapes"]);
  const filter = createFilter({ sensitivity: "base" });
  const [options, setOptions] = createSignal<string[]>(ALL_OPTIONS);
  const onOpenChange = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptions(ALL_OPTIONS);
    }
  };
  const onInputChange = (value: string) => {
    setOptions(ALL_OPTIONS.filter(option => filter.contains(option, value)));
  };
  return (
    <>
      <Combobox.Root<string>
        multiple
        options={options()}
        value={values()}
        onChange={setValues}
        onInputChange={onInputChange}
        onOpenChange={onOpenChange}
        placeholder="Search some fruits…"
        itemComponent={props => (
          <Combobox.Item item={props.item}>
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            <Combobox.ItemIndicator>
              <FaSolidCheck />
            </Combobox.ItemIndicator>
          </Combobox.Item>
        )}
      >
        <Combobox.Control<string> aria-label="Fruits">
          {state => (
            <>
              <div>
                <For each={state.selectedOptions()}>
                  {option => (
                    <span onPointerDown={e => e.stopPropagation()}>
                      {option}
                      <button onClick={() => state.remove(option)}>
                        <HiSolidX />
                      </button>
                    </span>
                  )}
                </For>
                <Combobox.Input />
              </div>
              <button onPointerDown={e => e.stopPropagation()} onClick={state.clear}>
                <HiSolidX />
              </button>
              <Combobox.Trigger>
                <Combobox.Icon>
                  <BiSolidSortAlt />
                </Combobox.Icon>
              </Combobox.Trigger>
            </>
          )}
        </Combobox.Control>
        <Combobox.Portal>
          <Combobox.Content>
              <Combobox.Listbox
              style={{
                'width': '600px',
                'padding': '10px 10px 10px 10px',
                'filter': 'unset',
                'background-color': 'lightgray',
                'font-size': 'large',
                'list-style-type': 'none'
                }}
              />
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>
    </>
  );
}
export default ComboboxMulti