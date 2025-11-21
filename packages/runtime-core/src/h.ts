import { isObject } from '@vue/shared'

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
    if (Array.isArray(propsOrChildreen)) {
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

function isVNode(value) {
  return value?.__v_isVNode
}

function createVNode(type, props, childern?) {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children: childern,
    key: props?.key, // for diff
    el: null, // 虚拟节点要挂在的元素
    shapeFlag: 9,
  }

  return vnode
}
