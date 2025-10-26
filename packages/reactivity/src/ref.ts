import { activeSub } from './effect'
import { Link, link, propagate } from './system'

enum ReactiveFlags {
  IS_REF = "__v_isRef"
}

class RefImpl {
  _value // 保存实际的值
  [ReactiveFlags.IS_REF] = true // ref 标记
  // 订阅者链表的头节点
  subs: Link
  // 订阅者链表的尾节点
  subsTail: Link

  constructor(value) {
    this._value = value
  }

  get value() {
    if (activeSub) {
      trackRef(this)
    }

    return this._value
  }


  set value(newValue) {
    this._value = newValue
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
