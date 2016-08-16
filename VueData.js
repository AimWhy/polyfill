;
window.Vue = (function () {

    /* 管理订阅者 */

    var uid$2 = 0;

    function Dep() {
        this.id = uid$2++;
        this.subs = [];
    }

    Dep.prototype.addSub = function addSub(sub) {
        var index = this.subs.indexOf(sub);
        if (index === -1) {
            this.subs.push(sub);
        }
    };

    Dep.prototype.removeSub = function removeSub(sub) {
        var index = this.subs.indexOf(sub);
        if (index > -1) {
            this.subs.splice(index, 1);
        }
    };

    Dep.prototype.notify = function notify() {
        var subs = this.subs.slice();
        for (var i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
    };

    Dep.target = null;


    /* 订阅者 */

    var uid$1 = 0;

    var Watcher = function (vm, expOrFn, cb) {
        this.id = uid$1++;
        this.vm = vm;
        this.cb = cb;
        this.expOrFn = expOrFn;
        this.val = this.get();
    }

    Watcher.prototype.update = function run() {
        var val = this.get();
        if (val !== this.val) {
            this.val = val;
            this.cb.call(this.vm);
        }
    };

    Watcher.prototype.get = function get() {
        Dep.target = this;
        var val = this.vm._data[this.expOrFn];
        Dep.target = null;
        return val;
    };


    /* 监听数据变化 */

    var Observer = function (value) {
        this.value = value;
        this.walk(value);
    }

    Observer.prototype.walk = function walk(obj) {
        var val = this.value;
        for (var key in obj) {
            defineReactive(val, key, obj[key]);
        }
    };

    function observe(value) {
        if (value && typeof value === 'object') {
            return new Observer(value);
        } else {
            return void (0);
        }
    }

    function defineReactive(obj, key, val) {
        var dep = new Dep();
        observe(val);

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function () {
                console.log('get value');
                /*
                    如果Dep类存在target属性，将其添加到dep实例的subs数组中
                    target指向一个Watcher实例，每个Watcher都是一个订阅者
                    Watcher实例在实例化过程中，会读取data中的某个属性，从而触发当前get方法
                */
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: function (newVal) {
                if (val !== newVal) {
                    console.log('new value seted');
                    val = newVal;
                    observe(newVal);
                    dep.notify();
                }
            }
        });
    }


    /* Vue */

    var uid$3 = 0;

    function Vue(options) {
        var vm = this;
        vm._uid = uid$3++;
        vm.$options = options || {};
        var data = this._data = this.$options.data;

        Object.keys(data).forEach(function (key) {
            this._proxy(key);
        }, vm);

        // 监听数据
        observe(data);
    }

    Vue.prototype._proxy = function _proxy(key) {
        Object.defineProperty(this, key, {
            configurable: true,
            enumerable: true,
            get: function () { return this._data[key] },
            set: function (val) { this._data[key] = val; }
        });
    };

    Vue.prototype.$watch = function $watch(expOrFn, cb) {
        return new Watcher(this, expOrFn, cb);
    };

    return Vue;
})();
