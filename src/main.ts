import { reactive, wrapFunctionAsDependency as $ } from '@/modules/reactive'
import { mount } from '@/modules/fire'

const source = reactive({
  a: {
    tag: 'div',
    text: $((node: any) => node.$.b.text + node.$.c.text),
  },
  b: {
    tag: 'div',
    text: 'hello',
  },
  c: {
    tag: 'div',
    text: 'world',
  },
})

const app = document.getElementById('app')!

mount(app, source)

globalThis.source = source
