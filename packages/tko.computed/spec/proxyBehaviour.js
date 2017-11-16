
import {
  proxy, unproxy, peek, isProxied, getObservable
} from '../src/proxy'

import {
  observable
} from 'tko.observable'

import {
  computed
} from 'tko.computed'

describe('Proxy', function () {
  it('Should wrap a plain object', function () {
    const x = {}
    const p = proxy(x)
    expect(isProxied(p)).toBe(true)
  })

  it('Should expose properties of the proxy', function () {
    const x = { a: 123 }
    const p = proxy(x)
    expect(p.a).toBe(123)
    expect(peek(p, 'a')).toBe(123)
    p.a = 124
    expect(p.a).toBe(124)
    expect(x.a).toBe(124)
    p.b = 456
    expect(x.b).toBe(456)
    expect(p.b).toBe(456)
    expect(peek(p, 'b')).toBe(456)
  })

  it('unproxies to the original', function () {
    const x = {}
    expect(unproxy(proxy(x))).toEqual(x)
  })

  it('creates dependencies on the proxied elements', function () {
    const p = proxy({ a: 1 })
    let a2 = computed(() => p.a * p.a)
    expect(a2()).toBe(1)
    p.a++
    expect(a2()).toBe(4)
  })

  it('does not create dependencies with `peek`', function () {
    const p = proxy({ a: 123 })
    let pa = 0
    computed(() => {
      pa = peek(p, 'a')
    })
    expect(pa).toBe(123)
    p.a++
    expect(pa).toBe(123)
  })

  it('exposes the observable with getObservable', function () {
    const p = proxy({ a: 123 })
    expect(getObservable(p, 'a')()).toBe(123)
  })

  it('converts functions to deferred, pure computeds', function () {
    const x = observable(9)
    const p = proxy({
      a() { return x() * 2 }, // readable computed
      b(nv) { x(nv) } // writeable computed
    })
    expect(p.a).toBe(18)
    p.b = 8
    expect(x()).toBe(8)
    expect(p.a).toBe(16)
  })
})