import { hasChanged, isObject } from '@vue/shared'
import { activeSub } from './effect'
import { Link, link, propagate } from './system'
import { reactive } from './reactive'

export enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

class RefImpl {
  _value; // 保存实际的值
  [ReactiveFlags.IS_REF] = true // ref 标记
  // 订阅者链表的头节点
  subs: Link
  // 订阅者链表的尾节点
  subsTail: Link

  constructor(value) {
    this._value = isObject(value) ? reactive(value) : value
  }

  get value() {
    if (activeSub) {
      trackRef(this)
    }

    return this._value
  }

  set value(newValue) {
    if (!hasChanged(newValue, this._value)) return

    this._value = isObject(newValue) ? reactive(newValue) : newValue
    triggerRef(this)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}

/**
 * 收集依赖项
 * @param dep 依赖项
 */
export function trackRef(dep) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

/**
 * 触发依赖项
 * @param dep 依赖项
 */
export function triggerRef(dep) {
  if (dep.subs) {
    propagate(dep.subs)
  }
}
