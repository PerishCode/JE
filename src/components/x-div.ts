import { observe, getRaw, getReaction } from '@/modules/reactive'
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
          set: () => updateElement(source, key, document.createElement('div')),
          delete: () => reaction2elementMap.get(source)?.get(key)?.remove(),
          add: () =>
            root.appendChild(
              mountElement(source, key, document.createElement('div'))
            ),
        }

        operationHandler[innerOperation.type || 'add']()
      })

      observe(() => {
        const element = reaction2elementMap.get(source)!.get(key)!
        const props = (element.textContent = target.props.text)
      })
    }
  }
}
