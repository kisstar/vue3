const doc = (typeof document !== 'undefined' ? document : null) as Document

export const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null)
  },

  remove: (child) => {
    const parent = child.parentNode

    if (parent) {
      parent.removeChild(child)
    }
  },

  createElement: (tag): Element => {
    const el = doc.createElement(tag)

    return el
  },

  createText: (text) => doc.createTextNode(text),

  setText: (node, text) => {
    node.nodeValue = text
  },

  setElementText: (el, text) => {
    el.textContent = text
  },

  querySelector: (selector) => doc.querySelector(selector),
}
