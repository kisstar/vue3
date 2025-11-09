import { isFunction, isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isRef } from './ref'
import { isReactive } from './reactive'

interface WatchOptions {
  immediate?: boolean
  once?: boolean
  deep?: boolean | number
}

export function watch(source, cb, options: WatchOptions = {}) {
  let { immediate, once, deep } = options
  let getter
  let oldValue

  if (once) {
    const _cb = cb

    cb = (...args) => {
      _cb(...args)
      stop()
    }
  }

  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    deep ??= true // 针对 reactive 对象，默认深度监听
  } else if (isFunction(source)) {
    getter = source
  }

  if (deep) {
    const baseGetter = getter

    deep = deep === true ? Infinity : deep
    getter = () => {
      return traverse(baseGetter(), deep as number)
    }
  }

  const effect = new ReactiveEffect(getter)

  function job() {
    const newValue = effect.run()

    cb(newValue, oldValue)
    oldValue = newValue
  }

  effect.scheduler = job

  if (immediate) {
    job()
  } else {
    oldValue = effect.run()
  }

  function stop() {
    effect.stop()
  }

  return stop
}

function traverse(value, depth = Infinity, seen = new Set()) {
  if (!isObject(value)) {
    return value
  }

  if (seen.has(value)) {
    return value
  }

  if (depth <= 0) {
    return value
  }

  depth--
  seen.add(value)

  for (const key in value) {
    traverse(value[key], depth, seen)
  }

  return value
}
