```javascript
var cycleTimeout = function (param) {
    var opt = {
        timeoutId: void (0),
        delay: param.delay || 1000,
        limit: param.limit || Infinity,
        limitFun: param.limitFun || null,
        cycleFun: param.cycleFun || null
    },
        result = {};

    function wrapFunc() {
        if (opt.limit-- > 0) {
            opt.cycleFun && opt.cycleFun();
            opt.timeoutId = window.setTimeout(wrapFunc, opt.delay);
        } else {
            opt.limitFun && opt.limitFun();
        }
    }

    result.option = function (key, val) {
        if (arguments.length > 1) {
            opt[key] = val;
            return result;
        } else if (arguments.length === 1) {
            return opt[key];
        } else {
            return opt;
        }
    };

    result.clear = function () {
        window.clearTimeout(opt.timeoutId);
    };

    result.run = function () {
        wrapFunc();
    };

    return result;
};
```
