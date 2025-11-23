import { isArray, isString, ShapeFlags } from '@vue/shared'

export function isVNode(value) {
  return value?.__v_isVNode
}

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export function createVNode(type, props, childern = null) {
  let shapeFlag = 0

  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
  }
  if (isString(childern)) {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (isArray(childern)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children: childern,
    key: props?.key, // for diff
    el: null, // 虚拟节点要挂在的元素
    shapeFlag,
  }

  return vnode
}
