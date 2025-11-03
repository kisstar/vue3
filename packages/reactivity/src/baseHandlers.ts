import { hasChanged, isObject } from '@vue/shared'
import { track, trigger } from './dep'
import { isRef } from './ref'
import { reactive } from './reactive'

export const mutableHandlers = {
  get(target, key, receiver) {
    const result = Reflect.get(target, key, receiver)

    track(target, key)

    if (isRef(result)) {
      return result.value
    }

    return isObject(result) ? reactive(result) : result
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)

    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return result
    }

    if (hasChanged(value, oldValue)) {
      trigger(target, key, value)
    }

    return result
  },
}
