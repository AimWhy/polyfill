export function throttle(callback, wait, { start = true, middle = true, once = false }){
  let last = 0
  let timer
  let cancelled = false

  const fn = function (...args) {
    if (cancelled) {
      return
    }
    
    const delta = Date.now() - last
    last = Date.now()

    if (start) {
      start = false
      callback(...args)
      once && fn.cancel()
    } else if ((middle && delta < wait) || !middle) {
      clearTimeout(timer)
      timer = setTimeout(function () {
          last = Date.now()
          callback(...args)
          once && fn.cancel()
        },
        !middle ? wait : wait - delta
      )
    }
  }

  fn.cancel = function () {
    clearTimeout(timer)
    cancelled = true
  }

  return fn
}

export function debounce(callback, wait, { start = false, middle = false, once = false }) {
  return throttle(callback, wait, {start, middle, once})
}
