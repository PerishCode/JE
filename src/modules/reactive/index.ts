import {
  reactive,
  observe,
  unobserve,
  wrapFunctionAsDependency,
} from './engine'

import { WeakMapExtension, MapExtension } from './types'

import { getCallbackMap, getListenerMap, getRaw, getReaction } from './global'

export {
  reactive,
  observe,
  unobserve,
  wrapFunctionAsDependency,
  getReaction,
  getRaw,
  getListenerMap,
  getCallbackMap,
  WeakMapExtension,
  MapExtension,
}
