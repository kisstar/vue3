import { endTrack, Link, startTrack } from './system'

// 当前正在执行的 effect
export let activeSub

export function setActiveSub(effect) {
  activeSub = effect
}

class ReactiveEffect {
  deps?: Link
  depsTail?: Link
  tracking = false
  dirty = true

  constructor(public fn) {}

  run() {
    const prevSub = activeSub

    setActiveSub(this)
    startTrack(this)

    try {
      return this.fn()
    } finally {
      endTrack(this)
      setActiveSub(prevSub)
    }
  }

  scheduler() {
    this.run()
  }

  notify() {
    this.scheduler()
  }
}

export function effect(fn, options) {
  const e = new ReactiveEffect(fn)

  Object.assign(e, options)

  e.run()

  const runner = () => e.run()

  runner.effect = e

  return runner
}
