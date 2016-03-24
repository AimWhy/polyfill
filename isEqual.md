```javascript
/*对象相同判断*/
var _objectKeys = Object.keys || function (o) {
    var keys = [];
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            keys.push(i);
        }
    }
    return keys;
};

var _isArray = Array.isArray || function (obj) {
    return obj.push && typeof obj.length === 'number';
};

function _equals(a, b) {
    switch (typeof a) {
        case 'undefined':
        case 'boolean':
        case 'string':
        case 'number':
            return a === b;
        case 'object':
            if (a === null) {
                return b === null;
            }

            if (_isArray(a)) {
                if (!_isArray(b) || a.length !== b.length) {
                    return false;
                }

                for (var i = 0, l = a.length; i < l; i++) {
                    if (!_equals(a[i], b[i])) {
                        return false;
                    }
                }

                return true;
            }

            var bKeys = _objectKeys(b);
            var bLength = bKeys.length;
            if (_objectKeys(a).length !== bLength) {
                return false;
            }

            for (var j = 0; j < bLength; j++) {
                if (!_equals(a[bKeys[j]], b[bKeys[j]])) {
                    return false;
                }
            }

            return true;
        default:
            return a === b;
    }
}
```
