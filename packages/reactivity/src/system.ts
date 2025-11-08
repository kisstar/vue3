export interface Dependency {
  subs?: Link
  subsTail?: Link
}

export interface Sub {
  deps?: Link
  depsTail?: Link
}

export interface Link {
  sub: Sub // 订阅者
  prevSub?: Link
  nextSub?: Link

  dep: Dependency // 依赖项
  nextDep?: Link
}

let linkPool: Link

export function link(dep /* RefImpl */, sub /* ReactiveEffect */) {
  const currentDep = sub.depsTail
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep

  if (nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep
    return
  }

  let newLink

  if (linkPool) {
    newLink = linkPool
    linkPool = linkPool.nextDep
    newLink.nextDep = nextDep
    newLink.sub = sub
    newLink.dep = dep
  } else {
    newLink = {
      sub,
      prevSub: undefined,
      nextSub: undefined,
      dep,
      nextDep,
    }
  }

  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink
    newLink.prevSub = dep.subsTail
    dep.subsTail = newLink
  } else {
    dep.subs = newLink
    dep.subsTail = newLink
  }

  // 单链表
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink
    sub.depsTail = newLink
  } else {
    sub.deps = newLink
    sub.depsTail = newLink
  }
}

/**
 * 先计算出新的值，然后再通知依赖进行更新
 */
function processComputedUpdate(sub) {
  sub.update()
  propagate(sub.subs)
}

export function propagate(subs) {
  let link = subs
  let queueEffect = []

  while (link) {
    const sub = link.sub

    if (!sub.tracking) {
      if (sub.update) {
        // 处理计算属性
        processComputedUpdate(sub)
      } else {
        queueEffect.push(sub)
      }
    }

    link = link.nextSub
  }

  queueEffect.forEach((effect) => {
    effect.notify()
  })
}

export function startTrack(sub) {
  sub.tracking = true
  sub.depsTail = undefined
}

export function endTrack(sub) {
  sub.tracking = false
  const depsTail = sub.depsTail

  if (depsTail) {
    if (depsTail.nextDep) {
      clearTracking(depsTail.nextDep)
      depsTail.nextDep = undefined
    }
  } else if (sub.deps) {
    clearTracking(sub.deps)
    sub.deps = undefined
  }
}

function clearTracking(link: Link) {
  while (link) {
    const { dep, prevSub, nextSub, nextDep } = link

    if (prevSub) {
      prevSub.nextSub = nextSub
      link.nextSub = undefined
    } else {
      dep.subs = nextSub
    }

    if (nextSub) {
      nextDep.prevSub = prevSub
      link.prevSub = undefined
    } else {
      dep.subsTail = prevSub
    }

    link.sub = link.dep = undefined
    link.nextDep = linkPool
    linkPool = link
    link = nextDep
  }
}
