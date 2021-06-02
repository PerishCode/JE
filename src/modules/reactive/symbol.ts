const __dependency__ = Symbol('data item dependency function')
const __observed__ = Symbol('function has been wrapped as callback')

/**
 * key for all iterate callback
 */
const __iterate__ = Symbol('iterate')

/**
 * callback-sets that contain callback to remove
 */
const __cleaners__ = Symbol('cleaners')

export { __cleaners__, __dependency__, __iterate__, __observed__ }
