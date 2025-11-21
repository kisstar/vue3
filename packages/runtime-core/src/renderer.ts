import { ShapeFlags } from '@vue/shared'
import { isSameVNodeType } from './vnode'

export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
  } = options

  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]

      patch(null, child, container)
    }
  }

  function mountElement(vnode, container) {
    /**
     * 1. 创建真实元素
     * 2. 设置它的 props
     * 3. 挂载它的子节点
     */

    const { type, props, children, shapeFlag } = vnode
    const el = hostCreateElement(type)

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }

    vnode.el = el
    hostInsert(el, container)
  }

  /**
   *
   * @param n1 老节点
   * @param n2 新节点
   * @param container 要挂载的容器
   */
  function patch(n1, n2, container) {
    if (n1 === n2) {
      return
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      // 卸载老节点
      unmount(n1)
      n1 = null
    }
    if (n1 === null) {
      mountElement(n2, container)
    } else {
      // TODO: update
    }
  }

  function unmountChildren(childern) {
    for (let i = 0; i < childern.length; i++) {
      unmount(childern[i])
    }
  }

  function unmount(vnode) {
    const { shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 子节点为数组需要遍历数组卸载每个孩子
      unmountChildren(vnode.children)
    }

    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    /**
     * 1. 挂载
     * 2. 更新
     * 3. 卸载
     */

    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode
  }

  return {
    render,
  }
}
