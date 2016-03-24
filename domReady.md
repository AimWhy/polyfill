```javascript
var ready = (function () {
    var jQuery = {
        isReady: false,
        ready: function () {
            var fun;
            while (fun = jQuery.readyList.shift()) {
                fun();
            }
            jQuery.isReady = true;
        },
        readyList: []
    };

    function detach() {
        if (document.addEventListener) {
            document.removeEventListener('DOMContentLoaded', completed, false);
            window.removeEventListener('load', completed, false);
        } else {
            document.detachEvent('onreadystatechange', completed);
            window.detachEvent('onload', completed);
        }
    }

    function completed() {
        if (document.addEventListener || event.type === 'load' || document.readyState === 'complete') {
            detach();
            jQuery.ready();
        }
    }

    if (document.readyState !== 'complete') {
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', completed, false);
            window.addEventListener('load', completed, false);
        } else {
            document.attachEvent('onreadystatechange', completed);
            window.attachEvent('onload', completed);

            var top = false;
            try {
                top = window.frameElement == null && document.documentElement;
            } catch (e) {
            }

            if (top && top.doScroll) {
                (function doScrollCheck() {
                    if (!jQuery.isReady) {
                        try {
                            top.doScroll('left');
                        } catch (ex) {
                            setTimeout(doScrollCheck, 50);
                        }

                        detach();
                        jQuery.ready();
                    }
                })();
            }
        }
    }

    return function (fun) {
        jQuery.readyList.push(fun);
        if (jQuery.isReady) {
            setTimeout(jQuery.ready);
        }
    };
})();
```
