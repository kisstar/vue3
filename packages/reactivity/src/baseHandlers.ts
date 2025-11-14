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

    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    }

    const targetIsArray = Array.isArray(target)
    const len = targetIsArray ? target.length : 0
    const result = Reflect.set(target, key, value, receiver)

    if (hasChanged(value, oldValue)) {
      trigger(target, key)
    }

    const newLen = targetIsArray ? target.length : 0

    if (len !== newLen && key !== 'length') {
      /**
       * 隐式更新length
       * 更新前：state = ['a', 'b', 'c', 'd']
       * 更新后：state = ['a', 'b', 'c', 'd', 'e']
       * 隐式更新原理：数组的 push、pop、shift、unshift、splice 方法会隐式更新 length 属性
       */
      trigger(target, 'length')
    }

    return result
  },
}
