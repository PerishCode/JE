import { wrapFunctionAsDependency as $ } from '@/modules/reactive'
import { __components__, __props__ } from '@/modules/fire'
import { Xdiv, Xinput } from '@/components'

export default {
  a: {
    component: Xdiv,
    props: {
      text: $((node: any) => {
        return node.$.$.b.props.value
      }),
    },
  },
  b: {
    component: Xinput,
    props: { value: 'world' },
  },
}
