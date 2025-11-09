import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'

const reactiveMap = new WeakMap()
const reactiveSet = new Set()

export function reactive(target) {
  return createReactiveObject(target)
}

function createReactiveObject(target) {
  if (!isObject(target)) {
    return target
  }

  if (reactiveMap.has(target)) {
    return reactiveMap.get(target)
  }

  if (reactiveSet.has(target)) {
    return target
  }

  const proxy = new Proxy(target, mutableHandlers)

  reactiveMap.set(target, proxy)
  reactiveSet.add(proxy)

  return proxy
}

export function isReactive(value) {
  return reactiveSet.has(value)
}
