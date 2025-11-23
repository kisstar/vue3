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

  function mountElement(vnode, container, anchor) {
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
    hostInsert(el, container, anchor)
  }

  function patchKeyedChildren(c1, c2, container) {
    /**
     * 全量 diff
     * 1. 双端 diff
     *
     * 1.1 头部比较
     * c1: [a, b]
     * c2: [a, b, c]
     * 开始时 i = 0，e1 = 1，e2 = 2
     * 结束时 i = 2, e1 = 1, e2 = 2
     *
     * 1.2 尾部对比
     * c1: [a, b]
     * c2: [c, a, b]
     * 开始时 i = 0，e1 = 1，e2 = 2
     * 结束时 i = 0, e1 = -1, e2 = 0
     *
     * 结论：
     * 当 i > e1 时，说明老的少，新的多，需要挂载，挂载范围是 i 到 e2
     * 当 i > e2 时，说明老的多，新的少，需要卸载，卸载范围是 i 到 e1
     */

    let i = 0 // 开始对比的下标

    // 老的子节点最后一个元素的下标
    let e1 = c1.length - 1

    // 新的子节点最后一个元素的下标
    let e2 = c2.length - 1

    /**
     * 1.1 头部比较
     * c1: [a, b]
     * c2: [a, b, c]
     *
     * 开始时 i = 0，e1 = 1，e2 = 2
     * 结束时 i = 2, e1 = 1, e2 = 2
     */
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSameVNodeType(n1, n2)) {
        // 如果 n1 和 n2 是同一个类型的子节点，那就可以更新复用
        patch(n1, n2, container)
      } else {
        break
      }

      i++
    }

    /**
     * 1.2 尾部对比
     * c1: [a, b]
     * c2: [c, a, b]
     * 开始时 i = 0，e1 = 1，e2 = 2
     * 结束时 i = 0, e1 = -1, e2 = 0
     */
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container)
      } else {
        break
      }

      e1--
      e2--
    }

    if (i > e1) {
      // 表示老的少，新的多，需要进行挂载，挂载范围是 i 到 e2

      const nextPos = e2 + 1
      const anchor = nextPos < c2.length ? c2[nextPos].el : null

      while (i <= e2) {
        patch(null, c2[i], container, anchor)
        i++
      }
    } else if (i > e2) {
      // 表示老的多，新的少，需要进行卸载，卸载范围是 i 到 e1

      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    }
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
            const c1 = n1.children
            const c2 = n2.children

            patchKeyedChildren(c1, c2, el)
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
  function patch(n1, n2, container, anchor = null) {
    if (n1 === n2) {
      return
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      // 卸载老节点
      unmount(n1)
      n1 = null
    }
    if (n1 === null) {
      mountElement(n2, container, anchor)
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
