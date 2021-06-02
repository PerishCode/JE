import { observe } from '@/modules/reactive'
import {
  reaction2elementMap,
  updateElement,
  mountElement,
} from '@/modules/fire'

export default (operation, root, source, key, target) => {
  switch (operation.type) {
    case 'set':
    case 'add':
    case 'delete':
      reaction2elementMap.get(source)?.get(key)?.remove()

    case undefined: {
      observe((innerOperation: any = {}) => {
        const operationHandler = {
          set: () =>
            updateElement(source, key, document.createElement('input')),
          delete: () => reaction2elementMap.get(source)?.get(key)?.remove(),
          add: () => {
            const element = document.createElement('input')

            element.addEventListener('input', (e: any) => {
              target.props.value = e.target.value
            })

            root.appendChild(mountElement(source, key, element))
          },
        }
        operationHandler[innerOperation.type || 'add']()
      })

      observe(() => {
        const element: any = reaction2elementMap.get(source)?.get(key)
        element && (element.value = target.props.value ?? '')
      })
    }
  }
}
