import { endTrack, Link, startTrack } from "./system"

// 当前正在执行的 effect
export let activeSub

class ReactiveEffect {
  deps?: Link
  depsTail?: Link

  constructor(public fn) {

  }

  run() {
    const prevSub = activeSub

    activeSub = this
    startTrack(this)

    try {
      return this.fn()
    } finally {
      endTrack(this)
      activeSub = prevSub
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
