import { reactive, wrapFunctionAsDependency as $ } from '@/modules/reactive'
import { mount } from '@/modules/fire'

const source = reactive({
  a: {
    tag: 'span',
    text: $((node: any) => node.$.b.text + node.$.c.value),
  },
  b: {
    tag: 'h2',
    text: 'hello',
  },
  c: {
    tag: 'input',
    value: 'world',
  },
})

const app = document.getElementById('app')!

mount(app, source)

globalThis.source = source
