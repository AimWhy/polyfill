```javascript
/*
Node.DOCUMENT_POSITION_DISCONNECTED	1
Node.DOCUMENT_POSITION_PRECEDING	2
Node.DOCUMENT_POSITION_FOLLOWING	4
Node.DOCUMENT_POSITION_CONTAINS	8
Node.DOCUMENT_POSITION_CONTAINED_BY	16
Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC	32
*/
var compareDocumentPosition = (function () {
    var indexOf = function (arr, needle) {
        if (arr.indexOf) {
            return arr.indexOf(needle);
        } else {
            for (var i = 0, length = arr.length; i < length; i++) {
                if (arr[i] === needle) {
                    return i;
                }
            }
            return -1;
        }
    };

    var documentElement = document.documentElement;

    if (documentElement.compareDocumentPosition) {
        return function (container, element) {
            return container.compareDocumentPosition(element);
        };
    }

    return function (container, element) {
        var thisOwner,
            otherOwner;

        if (container.nodeType === 9) {
            thisOwner = container;
        } else {
            thisOwner = container.ownerDocument;
        }


        if (element.nodeType === 9) {
            otherOwner = element;
        } else {
            otherOwner = element.ownerDocument;
        }

        if (container === element) {
            return 0; //相等，同一节点
        }

        if (container === otherOwner) {
            return 4 + 16; //前面 + 包含;
        }
        if (thisOwner === element) {
            return 2 + 8; //后面 + 被包含;
        }
        if (thisOwner !== otherOwner) {
            return 1; //无关，节点不相连
        }

        // Text nodes for attributes does not have a _parentNode. So we need to find them as attribute child.
        if (container.nodeType === 2 && container.childNodes && indexOf(container.childNodes, element) !== -1) {
            return 4 + 16; //前面 + 包含;
        }
        if (element.nodeType === 2 && element.childNodes && indexOf(element.childNodes, container) !== -1) {
            return 2 + 8; //后面 + 被包含;
        }


        var point = container;
        var parents = [];
        var previous;

        while (point) {
            if (point == element) {
                return 2 + 8; //后面 + 被包含;
            }
            parents.push(point);
            point = point.parentNode;
        }

        point = element;
        previous = null;

        while (point) {
            if (point == container) {
                return 4 + 16; //前面 + 包含;
            }
            var location_index = indexOf(parents, point);
            if (location_index !== -1) {
                var smallest_common_ancestor = parents[location_index];//container和element最近的公共祖先
                var this_index = indexOf(smallest_common_ancestor.childNodes, parents[location_index - 1]); //在公共祖先子节点中找到是container祖先的那个,获取其index
                var other_index = indexOf(smallest_common_ancestor.childNodes, previous); //在公共祖先子节点中找到是element祖先的那个,获取其index
                if (this_index > other_index) {
                    return 2; //后面;
                } else {
                    return 4; //前面;
                }
            }
            previous = point;
            point = point.parentNode;
        }

        return 1; //无关，节点不相连
    };

})();
```
