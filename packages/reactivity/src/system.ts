import { effect } from "./effect"

export interface Link {
  sub: Function
  prevSub?: Link
  nextSub?: Link
}

export function link(dep, sub) {
  const newLink = {
    sub: sub,
    prevSub: undefined,
    nextSub: undefined
  }

  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink
    newLink.prevSub = dep.subsTail
    dep.subsTail = newLink
  } else {
    dep.subs = newLink
    dep.subsTail = newLink
  }
}



export function progagate(subs) {
  let link = subs;
  let queueEffect = []

  while (link) {
    queueEffect.push(link.sub)
    link = link.nextSub
  }

  queueEffect.forEach(effect => {
    effect()
  })
}
