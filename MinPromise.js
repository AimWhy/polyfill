function noop (v) { return v }

function nextTick (fn) { setTimeout(fn, 4) }

function Handler (onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : noop
  this.onRejected = typeof onRejected === 'function' ? onRejected : noop
  this.promise = promise
}

function isPromise (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

function MinPromise (fn) {
  if (!(this instanceof MinPromise)) {
    throw new TypeError('Promises must be constructed via new')
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function')
  }

  this._state = 0
  this._handled = false
  this._value = undefined
  this._deferreds = []
  this._always = []

  doResolve(fn, this)
}

function doResolve (fn, self) {
  var done = false
  try {
    fn(function (value) {
      if (!done) {
        done = true
        resolve(self, value)
      }
    }, function (reason) {
      if (!done) {
        done = true
        reject(self, reason)
      }
    })
  } catch (ex) {
    if (!done) {
      done = true
      reject(self, ex)
    }
  }
}

function resolve (self, newValue) {
  try {
    if (newValue === self) {
      throw new TypeError('A promise cannot be resolved with itself.')
    }
    if (isPromise(newValue) && !(newValue instanceof MinPromise)) {
      doResolve(newValue.then.bind(newValue), self)
    } else {
      self._state = (newValue instanceof MinPromise) ? 3 : 1
      self._value = newValue
      finale(self)
    }
  } catch (e) {
    reject(self, e)
  }
}

function reject (self, newValue) {
  self._state = 2
  self._value = newValue
  finale(self)
}

function finale (self) {
  if (self._state === 2 && !self._deferreds.length) {
    nextTick(function () {
      if (!self._handled) {
        MinPromise.unhandledRejection(self._value)
      }
    })
  }
  var i
  var len
  for (i = 0, len = self._always.length; i < len; i++) {
    self._always[i]()
  }
  for (i = 0, len = self._deferreds.length; i < len; i++) {
    handle(self, self._deferreds[i])
  }
  self._deferreds.length = 0
}

function handle (self, deferred) {
  if (self._state === 0) {
    self._deferreds.push(deferred)
  } else {
    while (self._state === 3) {
      self = self._value
    }
    self._handled = true
    nextTick(function () {
      try {
        return self._state === 1 ? resolve(deferred.promise, deferred.onFulfilled(self._value))
        : reject(deferred.promise, deferred.onRejected(self._value))
      } catch (e) {
        reject(deferred.promise, e)
      }
    })
  }
}

MinPromise.prototype.then = function _then (onFulfilled, onRejected) {
  var promise = new MinPromise(noop)
  handle(this, new Handler(onFulfilled, onRejected, promise))
  return promise
}

MinPromise.prototype.catch = function _catch (onRejected) {
  return this.then(noop, onRejected)
}

MinPromise.prototype.finally = function _finally (callback) {
  this._state === 0 ? this._always.push(callback) : callback()
  return this
}

MinPromise.resolve = function resolve (value) {
  return (value instanceof MinPromise) ? value : new MinPromise(function (resolve1) { resolve1(value) })
}

MinPromise.reject = function reject (value) {
  return new MinPromise(function (resolve1, reject1) { reject1(value) })
}

MinPromise.race = function race (values) {
  return new MinPromise(function (resolve, reject) {
    for (var i = 0, len = values.length; i < len; i++) {
      values[i].then(resolve, reject)
    }
  })
}

MinPromise.all = function all (arr) {
  return new MinPromise(function (resolve, reject) {
    if (!arr || typeof arr.length !== 'number') {
      throw new TypeError('MinPromise.all accepts an array')
    }
    if (!arr.length) {
      return resolve([])
    }

    var args = Array.prototype.slice.call(arr)
    var remaining = args.length
    var res = function res (i, val) {
      try {
        if (isPromise(val)) {
          val.then(function (val) { res(i, val) }, reject)
        } else {
          args[i] = val
          if (--remaining === 0) {
            resolve(args)
          }
        }
      } catch (ex) {
        reject(ex)
      }
    }

    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

MinPromise.unhandledRejection = function unhandledRejection (err) {
  console.warn('Possible Unhandled MinPromise Rejection:', err)
}
