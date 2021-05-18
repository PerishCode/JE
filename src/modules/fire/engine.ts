import { MapExtension, observe, getRaw } from '@/modules/reactive'
import { reaction2elementMap } from './global'
import { TagHandler } from './types'

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

const commonTagSet = new Set(['div', 'span', 'h1', 'h2', 'h3'])

const inputTagSet = new Set(['input', 'select'])

function getTagHandler(tag: string = ''): TagHandler {
  if (commonTagSet.has(tag))
    return (operation, root, source, key, target) => {
      switch (operation.type) {
        case 'set':
        case 'add':
        case 'delete':
          reaction2elementMap.get(source)?.get(key)?.remove()

        case undefined: {
          observe((innerOperation: any = {}) => {
            const operationHandler = {
              set: () =>
                updateElement(source, key, document.createElement(target.tag)),
              delete: () => reaction2elementMap.get(source)?.get(key)?.remove(),
              add: () =>
                root.appendChild(
                  mountElement(source, key, document.createElement(target.tag))
                ),
            }
            operationHandler[innerOperation.type || 'add']()
          })

          observe(() => {
            const element = reaction2elementMap.get(source)?.get(key)
            element && (element.textContent = target.text)
          })
        }
      }
    }

  if (inputTagSet.has(tag))
    return (operation, root, source, key, target) => {
      switch (operation.type) {
        case 'set':
        case 'add':
        case 'delete':
          reaction2elementMap.get(source)?.get(key)?.remove()

        case undefined: {
          observe((innerOperation: any = {}) => {
            const operationHandler = {
              set: () =>
                updateElement(source, key, document.createElement(target.tag)),
              delete: () => reaction2elementMap.get(source)?.get(key)?.remove(),
              add: () => {
                const element = document.createElement(
                  target.tag
                ) as HTMLInputElement
                element.addEventListener('input', (e: any) => {
                  target.value = e.target.value
                })

                root.appendChild(mountElement(source, key, element))
              },
            }
            operationHandler[innerOperation.type || 'add']()
          })

          observe(() => {
            const element: any = reaction2elementMap.get(source)?.get(key)
            element && (element.value = target.value ?? '')
          })
        }
      }
    }

  return () => {}
}

/**
 * 对 Schema 的每一项属性添加监听
 *
 * @param root Schema 要挂载的目标 Element
 * @param source Schema 对象
 * @param key Schema 每一项的关键字
 * @returns
 */
function generateObservation(root: HTMLElement, source: any, key: any) {
  return (operation: any = {}) => {
    const target: any = source[key]
    const raw: any = getRaw(target)

    const tagHandler = getTagHandler(raw.tag)

    tagHandler(operation, root, source, key, target)
  }
}

function mount(root: HTMLElement, source: any) {
  Object.keys(source).forEach(key =>
    observe(generateObservation(root, source, key))
  )
}

export { mount }
