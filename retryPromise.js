var retryPromise = function (promise, args, context, maxTries = 1) {
  context = context || null
  return promise.apply(context, args).then(function (d) {
    return Promise.resolve(d)
  }, function (err) {
    return (maxTries === -1) ? Promise.reject(err) : retryPromise(promise, args, maxTries - 1)
  })
}
