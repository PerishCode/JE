import {
  reactive,
  observe,
  unobserve,
  wrapFunctionAsDependency,
} from './engine'

import { WeakMapExtension, MapExtension } from './types'

import { getCallbackMap } from './global'

export {
  reactive,
  observe,
  unobserve,
  wrapFunctionAsDependency,
  getCallbackMap,
  WeakMapExtension,
  MapExtension,
}
