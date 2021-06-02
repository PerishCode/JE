import { MapExtension, observe, getRaw } from '@/modules/reactive'
import { reaction2elementMap } from './global'
import { __components__, __props__ } from './symbol'

function mountElement(source: any, key: any, element: HTMLElement) {
  return reaction2elementMap
    .acquire(source, new MapExtension())
    .acquire(key, element)
}

function updateElement(source: any, key: any, element: HTMLElement) {
  const elementMap = reaction2elementMap.get(source)!
  const prevElement = elementMap.get(key)!

  prevElement.childNodes.forEach(node => element.appendChild(node))
  prevElement.parentElement!.replaceChild(element, prevElement)

  elementMap.set(key, element)
}

function mountComponents(
  root: HTMLElement,
  components: Function[],
  props: any
) {
  observe(function __mountComponents__() {
    components.reduceRight((prev, component) => {
      return prev
    }, root)
  })
}

function mount(root: HTMLElement, source: any) {
  observe(function __mount__() {
    /**
     * 该回调函数当且仅当 __component__ 和 __props__ 发生变化时被触发
     */
    mountComponents(root, source[__components__], source[__props__])
  })
}

export { mount, updateElement, mountElement }
