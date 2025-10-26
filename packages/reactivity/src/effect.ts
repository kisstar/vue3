// 当前正在执行的 effect
export let activeSub

class ReactiveEffect {
  constructor(public fn) {

  }

  run() {
    const prevSub = activeSub
    activeSub = this

    try {
      return this.fn()
    } finally {
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
