import { isFunction } from '@vue/shared'
import { ReactiveFlags } from './ref'
import { Dependency, endTrack, link, Link, startTrack, Sub } from './system'
import { activeSub, setActiveSub } from './effect'

class ComputedRefImpl implements Dependency, Sub {
  [ReactiveFlags.IS_REF] = true
  _value
  subs?: Link
  subsTail?: Link
  deps?: Link
  depsTail?: Link

  constructor(
    public fn,
    private setter,
  ) {}

  get value() {
    this.update()

    // 计算属性和 effect 之间建立依赖关系
    if (activeSub) {
      link(this, activeSub)
    }

    return this._value
  }

  set value(newValue) {
    this.setter(newValue)
  }

  update() {
    const prevSub = activeSub

    //  建立计算属性和依赖的响应式数据之间的关系
    setActiveSub(this)
    startTrack(this)

    try {
      this._value = this.fn()
    } finally {
      endTrack(this)
      setActiveSub(prevSub)
    }
  }
}

export function computed(getterOrOptions) {
  let getter
  let setter

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => {
      console.warn('Write operation failed: computed value is readonly')
    }
  } else {
    getter = getterOrOptions.get
    setter =
      getterOrOptions.set ||
      (() => {
        console.warn('Write operation failed: computed value is readonly')
      })
  }

  return new ComputedRefImpl(getter, setter)
}
