```javascript
var localStore = (function () {
    'use strict';

    var noop = function () { };

    var win = window,
        doc = win.document,
        localStorageName = 'localStorage',
        scriptTag = 'script',
        storage;

    var store = {
        disabled: false,
        set: noop,
        get: noop,
        has: function (key) { return store.get(key) !== undefined; },
        remove: noop,
        clear: noop,
        transact: function (key, defaultVal, transactionFn) {
            if (transactionFn == null) {
                transactionFn = defaultVal;
                defaultVal = null;
            }
            if (defaultVal == null) {
                defaultVal = {};
            }
            var val = store.get(key, defaultVal);
            transactionFn(val);
            store.set(key, val);
        },
        getAll: function () {
            var ret = {};
            store.forEach(function (key, val) {
                ret[key] = val;
            });
            return ret;
        },
        forEach: noop,
        serialize: function (value) {
            return JSON.stringify(value);
        },
        deserialize: function (value) {
            if (typeof value != 'string') {
                return undefined;
            }
            try {
                return JSON.parse(value);
            } catch (ex) {
                return value || undefined;
            }
        }
    };

    function isLocalStorageNameSupported() {
        try {
            return (localStorageName in win && win[localStorageName]);
        } catch (ex) {
            return false;
        }
    }

    if (isLocalStorageNameSupported()) {
        storage = win[localStorageName];
        store.set = function (key, val) {
            if (val === undefined) {
                return store.remove(key);
            }
            storage.setItem(key, store.serialize(val));
            return val;
        };
        store.get = function (key, defaultVal) {
            var val = store.deserialize(storage.getItem(key));
            return (val === undefined ? defaultVal : val);
        };
        store.remove = function (key) { storage.removeItem(key); };
        store.clear = function () { storage.clear(); };
        store.forEach = function (callback) {
            for (var i = 0; i < storage.length; i++) {
                var key = storage.key(i);
                callback(key, store.get(key));
            }
        };
    } else if (doc.documentElement.addBehavior) {
        var storageOwner,
            storageContainer;

        try {
            storageContainer = new ActiveXObject('htmlfile');
            storageContainer.open();
            storageContainer.write('<' + scriptTag + '>document.w=window</' + scriptTag + '><iframe src="/favicon.ico"></iframe>');
            storageContainer.close();
            storageOwner = storageContainer.w.frames[0].document;
            storage = storageOwner.createElement('div');
        } catch (e) {
            storage = doc.createElement('div');
            storageOwner = doc.body;
        }

        var withIEStorage = function (storeFunction) {
            return function () {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift(storage);

                storageOwner.appendChild(storage);
                storage.addBehavior('#default#userData');
                storage.load(localStorageName);

                var result = storeFunction.apply(store, args);

                storage.save(localStorageName);
                storageOwner.removeChild(storage);
                return result;
            };
        };
        var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", 'g');
        var ieKeyFix = function (key) {
            return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
        };

        store.set = withIEStorage(function (pStorage, key, val) {
            key = ieKeyFix(key);
            if (val === undefined) {
                return this.remove(key);
            }
            pStorage.setAttribute(key, this.serialize(val));
            return val;
        });
        store.get = withIEStorage(function (pStorage, key, defaultVal) {
            key = ieKeyFix(key);
            var val = this.deserialize(pStorage.getAttribute(key));
            return (val === undefined ? defaultVal : val);
        });
        store.remove = withIEStorage(function (pStorage, key) {
            key = ieKeyFix(key);
            pStorage.removeAttribute(key);
        });
        store.clear = withIEStorage(function (pStorage) {
            var attributes = pStorage.XMLDocument.documentElement.attributes,
                len = attributes.length;
            while (len--) {
                pStorage.removeAttribute(attributes[len].name);
            }
        });
        store.forEach = withIEStorage(function (pStorage, callback) {
            var attributes = pStorage.XMLDocument.documentElement.attributes;
            for (var i = 0, attr, len = attributes.length; i < len ; i++) {
                attr = attributes[i];
                callback(attr.name, this.deserialize(pStorage.getAttribute(attr.name)));
            }
        });
    }

    try {
        var testKey = '__storejs__';
        store.set(testKey, testKey);
        if (store.get(testKey) != testKey) {
            store.disabled = true;
        }
        store.remove(testKey);
    } catch (e) {
        store.disabled = true;
    }

    store.enabled = !store.disabled;
    return store;

})();
```
