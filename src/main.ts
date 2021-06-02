import { mount } from '@/modules/fire'
import schema from '@/schemas/withSymbol'

mount(document.getElementById('app')!, (globalThis.source = schema))
