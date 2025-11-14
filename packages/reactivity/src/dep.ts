import { activeSub } from './effect'
import { Link, link, propagate } from './system'

const targetMap = new WeakMap()

export function track(target, key) {
  if (!activeSub) {
    return
  }

  let depsMap = targetMap.get(target)

  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)

  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }

  link(dep, activeSub)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  const targetIsArray = Array.isArray(target)

  if (targetIsArray && key === 'length') {
    /**
     * 原始数组 ['a', 'b', 'c', 'd']
     * 修改前： length = 4，数组为 ['a', 'b', 'c', 'd']
     * 修改后： length = 2, 数组变为 ['a', 'b']
     * 说明： 修改数组长度时，数组长度小于当前数组长度时，会删除从下标为数组长度到原数组长度的元素
     * 结论： 修改数组长度时，需要通知访问了通过改变 length 删除的元素的副作用函数重新执行
     *
     * depsMap = {
     *     0: Dep
     *     1: Dep
     *     2: Dep
     *     3: Dep
     *     length: Dep
     * }
     */

    const len = target.length

    depsMap.forEach((dep, depKey) => {
      if (Number(depKey) >= len || depKey === 'length') {
        propagate(dep.subs)
      }
    })
  } else {
    if (!depsMap) return

    const dep = depsMap.get(key)
    if (!dep) return

    propagate(dep.subs)
  }
}

class Dep {
  subs: Link
  subsTail: Link
}
