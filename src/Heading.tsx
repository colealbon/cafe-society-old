import { Separator } from "@kobalte/core";
const Heading = (props: {
    children?: any
  }) => {
    return (
    <div style={{
      'display': 'flex',
      'flex-direction': 'column',
      'align-items': 'center'}}>
        <h1>{props.children}</h1>
        <Separator.Root class="separator" />
    </div>
    )
}

export default Heading;