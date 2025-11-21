import { isArray, isObject } from '@vue/shared'
import { createVNode, isVNode } from './vnode'

/**
 * 主要是对参数做一个标准化，最终调用 createVNode 函数来创建虚拟节点
 *
 * h('div', 'hello world')
 * h('div', h('span', 'hello world'))
 * h('div', [h('span', 'hello world')])
 * h('div', {}, 'hello world')
 * h('div', {}, h('span', 'hello'), ' world')
 */
export function h(type, propsOrChildreen, childern) {
  const l = arguments.length

  if (l === 2) {
    if (isArray(propsOrChildreen)) {
      return createVNode(type, null, propsOrChildreen)
    }
    if (isObject(propsOrChildreen)) {
      if (isVNode(propsOrChildreen)) {
        return createVNode(type, null, [propsOrChildreen])
      }

      return createVNode(type, propsOrChildreen, childern)
    }

    return createVNode(type, null, propsOrChildreen)
  } else {
    if (l > 3) {
      childern = [...arguments].slice(2)
    } else if (isVNode(childern)) {
      childern = [childern]
    }

    return createVNode(type, propsOrChildreen, childern)
  }
}
