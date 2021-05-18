import { __cleaners__, __observed__ } from './symbol'

class WeakMapExtension<K extends object, V> extends WeakMap<K, V> {
  acquire(key: K, defaultValue: V) {
    let value = this.get(key)
    value === undefined && this.set(key, (value = defaultValue))
    return value
  }
}

class MapExtension<K, V> extends Map<K, V> {
  acquire(key: K, defaultValue: V) {
    let value = this.get(key)
    value === undefined && this.set(key, (value = defaultValue))
    return value
  }
}

type Key = string | number | symbol

type Raw = object
type Reaction = object

type Callback = Function & {
  [__cleaners__]?: CallbackSet[]
  [__observed__]?: boolean
}

type CallbackSet = Set<Callback>
type CallbackMap = MapExtension<Key, CallbackSet>

interface Opeartion {
  type?: 'get' | 'iterate' | 'add' | 'set' | 'delete' | 'clear' | 'has' | 'any'
  target: Raw
  key: Key
  receiver?: any
  value?: any
  oldValue?: any
}

export {
  Key,
  Raw,
  Reaction,
  Callback,
  CallbackSet,
  CallbackMap,
  Opeartion,
  MapExtension,
  WeakMapExtension,
}
