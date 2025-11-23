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

  function patchChildren(n1, n2) {
    /**
     * 1. 新节点它的子节点是文本
     *  1.1 老的也是文本
     *  1.2 老的是数组
     *  1.3 老的可能是 null
     * 2. 新的子节点是数组，或者是 null
     *  2.1 老的也是数组
     *  2.2 老的是文本
     *  2.3 老的可能是 null
     */

    const el = n2.el
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新的是文本，老的是数组，则卸载老的
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(n1.children)
      }

      // 新的是文本，老的是文本或者null，直接比对内容，如果不同直接更新文本
      if (n1.children !== n2.children) {
        hostSetElementText(el, n2.children)
      }
    } else {
      /**
       * 新的可能是数组或者null
       * 老的可能是文本、数组或者null
       */

      // 老的是文本
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 直接卸载老的
        hostSetElementText(n1.el, '')

        // 新的是 null 就忽略，如果是数组就挂载
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(n2.children, n1.el)
        }
      } else {
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 老的是数组
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // TODO: diff children
          } else {
            // 新的是 null，直接卸载老的
            unmountChildren(n1.children)
          }
        } else {
          // 老的是 null
          if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 新的是数组直接挂载
            mountChildren(n2.children, el)
          }
        }
      }
    }
  }

  function patchProps(el, oldProps, newProps) {
    /**
     * 1. 把老的全部删除掉
     * 2. 把新的全部添加上去
     */

    if (oldProps) {
      for (const key in oldProps) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }

    if (newProps) {
      for (const key in newProps) {
        hostPatchProp(el, key, oldProps?.[key], newProps[key])
      }
    }
  }

  function patchElement(n1, n2) {
    /**
     * 1. 复用 dom 元素
     * 2. 更新 props
     * 3. 更新 children
     */
    // 复用上一次的 dom 元素
    const el = (n2.el = n1.el)

    // 更新 props
    const oldProps = n1.props
    const newProps = n2.props

    patchProps(el, oldProps, newProps)

    // 更新 children
    patchChildren(n1, n2)
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
      patchElement(n1, n2)
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
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
