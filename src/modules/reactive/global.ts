import {
  Callback,
  CallbackMap,
  Key,
  Raw,
  Reaction,
  WeakMapExtension,
  MapExtension,
} from './types'

const KeyOfIterateFunction = new Set<Key>([
  'forEach',
  'map',
  Symbol.iterator,
  'values',
  'keys',
  'every',
  'reduce',
])

const raw2reaction = new WeakMapExtension<Raw, Reaction>()
const reaction2raw = new WeakMapExtension<Reaction, Raw>()

const raw2callbackMap = new WeakMapExtension<Raw, CallbackMap>()
const raw2ListenerMap = new WeakMapExtension<Raw, MapExtension<Key, Callback>>()

const raw2parent = new WeakMapExtension<Raw, Reaction>()
const raw2visited = new WeakMapExtension<Raw, Set<Key>>()

const callbackStack = new Array<Callback>()

function getReaction(raw: Raw) {
  return raw2reaction.get(raw)
}

function getRaw(reaction: Reaction) {
  return reaction2raw.get(reaction)
}

function getCallbackMap(raw: Raw) {
  return raw2callbackMap.get(raw) ?? raw2callbackMap.get(reaction2raw.get(raw)!)
}

function getListenerMap(raw: Raw) {
  return raw2ListenerMap.get(raw) ?? raw2ListenerMap.get(reaction2raw.get(raw)!)
}

export {
  KeyOfIterateFunction,
  raw2reaction,
  reaction2raw,
  raw2callbackMap,
  raw2ListenerMap,
  raw2parent,
  raw2visited,
  callbackStack,
  MapExtension,
  WeakMapExtension,
}

export { getReaction, getRaw, getCallbackMap, getListenerMap }
