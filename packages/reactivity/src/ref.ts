import { activeSub } from './effect'

enum ReactiveFlags {
  IS_REF = "__v_isRef"
}

class RefImpl {
  _value // 保存实际的值
  [ReactiveFlags.IS_REF] = true // ref 标记
  subs // 保存和 effect 的依赖

  constructor(value) {
    this._value = value
  }

  get value() {
    if (activeSub) {
      this.subs = activeSub
    }
    return this._value
  }


  set value(newValue) {
    this._value = newValue
    this.subs?.()
  }
}

export function ref(value) {
  return new RefImpl(value)
}


export function isRef(value) {
  return !!(value && value[ReactiveFlags.IS_REF])
}
