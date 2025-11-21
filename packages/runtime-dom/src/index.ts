import { nodeOps } from './nodeOps'
import { createRenderer } from '@vue/runtime-core'
import { patchProp } from './patchProp'

export * from '@vue/runtime-core'

export const renderOptions = { patchProp, ...nodeOps }
