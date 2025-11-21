import { nodeOps } from './nodeOps'
import { createRenderer } from '@vue/runtime-core'
import { patchProp } from './patchProp'

export * from '@vue/runtime-core'

const renderOptions = { patchProp, ...nodeOps }

export function render(vnode, container) {
  return createRenderer(renderOptions).render(vnode, container)
}

export { renderOptions }
