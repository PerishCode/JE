const __dependency__ = Symbol('data item dependency function')
const __observed__ = Symbol('function has been wrapped as callback')
const __iterate__ = Symbol('key for all iterate callback')
const __cleaners__ = Symbol('callback-sets that contain callback to remove')

export { __cleaners__, __dependency__, __iterate__, __observed__ }
