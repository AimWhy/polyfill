```javascript
if (!document.querySelectorAll) {
    var s = document.createStyleSheet();
    
    document.querySelectorAll = function (selector) {
        var result = [],
            hasAdded = [],
            selectorArr = selector.replace(/\[for\b/gi, '[htmlFor').split(','),
            selectorCount = selectorArr.length,
            allElements = document.all,
            elementCount;

        while (selectorCount--) {
            s.addRule(selectorArr[selectorCount], 'k:v');

            elementCount = allElements.length;

            while (elementCount--) {
                if (allElements[elementCount].currentStyle.k && !hasAdded[elementCount]) {
                    hasAdded[elementCount] = true;
                }
            }

            s.removeRule(0);
        }

        for (var i = 0, l = hasAdded.length; i < l; i++) {
            if (hasAdded[i] === true) {
                result.push(allElements[i]);
            }
        }

        return result;
    };
}
```
