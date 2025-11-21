const veiKey: unique symbol = Symbol('_vei')

/**
 * 创建一个事件调用器invoker
 * 用于包装事件处理函数，支持动态更新处理函数
 *
 * @param value - 要包装的事件处理函数
 * @returns 返回一个可调用的invoker对象，包含原始值属性和调用功能
 */
function createInvoker(value) {
  const invoker = (...args) => {
    invoker.value(...args)
  }

  invoker.value = value

  return invoker
}

export function patchEvent(el, rawName, prevValue, nextValue) {
  const name = rawName.slice(2).toLowerCase()
  const invokers = (el[veiKey] ??= {})
  const existingInvoker = invokers[name]

  if (nextValue) {
    if (existingInvoker) {
      existingInvoker.value = nextValue
      return
    }

    const invoker = createInvoker(nextValue)

    invokers[name] = invoker
    el.addEventListener(name, invoker)
  } else {
    // 如果新的没有但旧的存在，就移除事件监听并清除缓存
    if (existingInvoker) {
      el.removeEventListener(name, existingInvoker)
      invokers[name] = undefined
    }
  }
}
