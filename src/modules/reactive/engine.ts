import {
  raw2reaction,
  reaction2raw,
  raw2callbackMap,
  raw2ListenerMap,
  raw2parent,
  raw2visited,
  callbackStack,
  MapExtension,
} from './global'
import { isDependencyFunction, isIterateFunction, isObject } from './utils'
import { Callback, Opeartion, Raw } from './types'
import {
  __cleaners__,
  __dependency__,
  __iterate__,
  __observed__,
} from './symbol'

const shieldIterableCallback = {
  current: false,
}

function wrapFunctionAsDependency(f: Function) {
  f[__dependency__] = true
  return f
}

function wrapFunctionAsCallback(
  callback: Callback,
  f: Function,
  context: any,
  args: any[]
) {
  if (callback[__observed__]) return Reflect.apply(f, context, args)
  if (callbackStack.includes(callback)) return

  callbackStack.push(callback)
  const result = Reflect.apply(f, context, args)
  callback[__observed__] = true
  callback[__cleaners__] = []
  callbackStack.pop()

  return result
}

function observe(f: Function): Callback {
  const callback = (...args: any[]) =>
    wrapFunctionAsCallback(callback, f, this, args)
  callback()
  return callback
}

function unobserve(callback: Callback | undefined | null) {
  callback &&
    callback[__cleaners__]?.forEach(callbackSet => callbackSet.delete(callback))
}

function registerDependency(f: Function, { target, key }: Opeartion) {
  const funcCopy = f.bind(null)
  const reaction = raw2reaction.get(target)!

  let listernerMap = raw2ListenerMap.acquire(target, new MapExtension())

  unobserve(listernerMap.get(key))

  listernerMap.set(
    key,
    observe((operation: Opeartion) =>
      Reflect.set(reaction, key, funcCopy(reaction, operation))
    )
  )
}

function mountCallback(callback: Callback, { target, key }: Opeartion) {
  const callbackMap = raw2callbackMap.acquire(target, new MapExtension())
  const callbackSet = callbackMap.acquire(key, new Set())

  if (callbackSet.has(callback)) return

  console.log('mount', target, key)

  callbackSet.add(callback)
  callback[__cleaners__]?.push(callbackSet)
}

function triggerCallback(operation: Opeartion) {
  const { target, key } = operation

  const callbackMap = raw2callbackMap.get(target)

  if (callbackMap === undefined) return

  const notProtoKey = target.constructor.prototype[key] === undefined
  const triggerSet = new Set<Callback>()

  if (key !== __iterate__) callbackMap.get(key)?.forEach(c => triggerSet.add(c))
  if (shieldIterableCallback.current === false && notProtoKey)
    callbackMap.get(__iterate__)?.forEach(c => triggerSet.add(c))

  triggerSet.forEach(callback => callback(operation))
}

function dealWithReadOperation({ type, target, key }: Opeartion) {
  if (key === '$') return raw2parent.get(target)
  if (callbackStack.length === 0) return target[key]

  const callback = callbackStack[callbackStack.length - 1]
  const visited = raw2visited.get(target)

  if (isIterateFunction(target, key))
    raw2visited.set(target, new Set(Object.keys(target)))
  else if (visited !== undefined) {
    visited.delete(key)
    if (visited.size === 0) {
      raw2visited.delete(target)
      mountCallback(callback, { type, target, key: __iterate__ })
    }
  } else mountCallback(callback, { type, target, key })

  return Reflect.get(target, key)
}

const ArrayPrototypeWrapperMap = new Map<Function, Function>([
  [
    Array.prototype.splice,
    function _splice(...args: any) {
      shieldIterableCallback.current = true
      const result = Array.prototype.splice.apply(this, args)
      shieldIterableCallback.current = false
      triggerCallback({
        target: reaction2raw.get(this)!,
        key: __iterate__,
      })
      return result
    },
  ],
  [
    Array.prototype.push,
    function _push(...args: any[]) {
      shieldIterableCallback.current = true
      const result = Array.prototype.push.apply(this, args)
      shieldIterableCallback.current = false
      triggerCallback({
        target: reaction2raw.get(this)!,
        key: __iterate__,
      })
      return result
    },
  ],
  [
    Array.prototype.pop,
    function _pop() {
      shieldIterableCallback.current = true
      const result = Array.prototype.pop.apply(this)
      shieldIterableCallback.current = false
      triggerCallback({
        target: reaction2raw.get(this)!,
        key: __iterate__,
      })
      return result
    },
  ],
  [
    Array.prototype.shift,
    function _shift(...args: any) {
      shieldIterableCallback.current = true
      const result = Array.prototype.shift.apply(this, args)
      shieldIterableCallback.current = false
      triggerCallback({
        target: reaction2raw.get(this)!,
        key: __iterate__,
      })
      return result
    },
  ],
  [
    Array.prototype.unshift,
    function _unshift(...args: any[]) {
      shieldIterableCallback.current = true
      const result = Array.prototype.unshift.apply(this, args)
      shieldIterableCallback.current = false
      triggerCallback({
        target: reaction2raw.get(this)!,
        key: __iterate__,
      })
      return result
    },
  ],
])

const baseHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    let result = dealWithReadOperation({ target, key, receiver })

    if (ArrayPrototypeWrapperMap.has(result))
      return ArrayPrototypeWrapperMap.get(result)
    if (isDependencyFunction(result)) {
      registerDependency(result, { target, key })
      result = Reflect.get(target, key)
    }
    if (!isObject(result)) return result
    if (!raw2parent.has(result))
      raw2parent.set(result, raw2reaction.get(target)!)
    return raw2reaction.get(result) || reactive(result)
  },
  set(target, key, value) {
    if (isObject(value)) value = reaction2raw.get(value) || value

    const hasKey = Object.prototype.hasOwnProperty.call(target, key)
    const oldValue = Reflect.get(target, key)
    const result = Reflect.set(target, key, value)

    if (target.constructor.prototype[key] !== undefined)
      triggerCallback({ target, key, type: 'set' })
    else if (!hasKey) triggerCallback({ target, key, type: 'add' })
    else if (value !== oldValue) triggerCallback({ target, key, type: 'set' })

    return result
  },
  deleteProperty(target, key) {
    const hasKey = Object.prototype.hasOwnProperty.call(target, key)
    const result = Reflect.deleteProperty(target, key)
    if (hasKey) triggerCallback({ target, key, type: 'delete' })
    return result
  },
  ownKeys(target) {
    dealWithReadOperation({ target, key: __iterate__ })
    return Reflect.ownKeys(target)
  },
}

const handlersMap = new Map<Function, object>([
  [Array, baseHandlers],
  [Object, baseHandlers],
])

function reactive(raw: Raw): any {
  if (!isObject(raw) || reaction2raw.has(raw)) return raw
  if (raw2reaction.has(raw)) return raw2reaction.get(raw)

  const reaction = new Proxy(raw, handlersMap.get(raw.constructor)!)
  raw2reaction.set(raw, reaction)
  reaction2raw.set(reaction, raw)
  return reaction
}

export {
  shieldIterableCallback,
  wrapFunctionAsCallback,
  wrapFunctionAsDependency,
  observe,
  unobserve,
  registerDependency,
  mountCallback,
  triggerCallback,
  dealWithReadOperation,
  reactive,
}
