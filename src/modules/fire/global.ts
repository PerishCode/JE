import { WeakMapExtension, MapExtension } from '@/modules/reactive'

type ElementMap = MapExtension<string, HTMLElement>

const reaction2elementMap = new WeakMapExtension<object, ElementMap>()

export { reaction2elementMap }
