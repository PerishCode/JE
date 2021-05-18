import { KeyOfIterateFunction } from './global'
import { Raw, Key } from './types'
import { __dependency__ } from './symbol'

function isObject(source: any) {
  return typeof source === 'object' && source != null
}

function isIterateFunction(target: Raw, key: Key) {
  return (
    KeyOfIterateFunction.has(key) &&
    typeof target.constructor.prototype[key] === 'function'
  )
}

function isDependencyFunction(source: any) {
  return typeof source === 'function' && source[__dependency__]
}

export { isIterateFunction, isDependencyFunction, isObject }
