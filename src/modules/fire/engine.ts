import { MapExtension, observe } from '@/modules/reactive'
import { reaction2elementMap } from './global'

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

function generateObservation(root: HTMLElement, source: any, key: any) {
  return (operation: any = {}) => {
    const target = source[key]

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
}

function mount(root: HTMLElement, source: any) {
  Object.keys(source).forEach(key =>
    observe(generateObservation(root, source, key))
  )
}

export { mount }
