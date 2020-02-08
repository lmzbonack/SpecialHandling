/* global opr safari */

/**
 * Browser will instantiate on page load and collect information about the browser. It
 * allows for easy retreival of this information through getter methods.
 * 
 * Usage:
 *     import Browser from '.../browserDetection';
 *     let browser = new Browser()
 *     alert(browser._isIE) // true
 * @class
 */
class Browser {
    constructor () {
        // User Agent string
        this.ua = window.navigator.userAgent;

        // Browsers

        // Opera 8.0+
        this._isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Firefox 1.0+
        this._isFirefox = typeof InstallTrigger !== 'undefined';
        // Safari 3.0+ "[object HTMLElementConstructor]" 
        this._isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
        // Internet Explorer 6-11
        this._isIE = /*@cc_on!@*/false || !!document.documentMode;
        // Edge 20+
        this._isEdge = !this._isIE && !!window.StyleMedia;
        // Chrome 1 - 68
        this._isChrome = !!window.chrome && !!window.chrome.webstore;

        // Engines

        // TODO
        // Gecko
        // TODO
        // Trident
        // TODO
        // Blink
        this._isBlink = (this._isChrome || this._isOpera) && !!window.CSS;

        // Capabilities

        // mobile devices (semi-reliably)
        this._isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        // touch cabability (semi-reliably)
        this._hasTouch = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);
    }

    /**
     * Returns an object containing all queries this class makes and stores as private variables. These
     * queries also include engine detection, mobile detection, etc.
     * @returns {Object}
     */
    get meta () {
        return {
            userAgent: this.ua,
            browser: {
                opera: this._isOpera,
                firefox: this._isFirefox,
                safari: this._isSafari,
                ie: this._isIE,
                edge: this._isEdge,
                chrome: this._isChrome
            },
            engine: {
                blink: this._isBlink
            },
            capabilities: {
                mobile: this._isMobile,
                touch: this._hasTouch
            }
        };
    }

    /**
     * Returns the current browser as a string
     * @returns {String} the current browser
     */
    get browser () {
        if (this._isOpera) { return 'opera'; }
        else if (this._isFirefox) { return 'firefox'; }
        else if (this._isSafari) { return 'safari'; }
        else if (this._isIE) { return 'internet explorer'; }
        else if (this._isEdge) { return 'edge'; }
        else if (this._isChrome) { return 'chrome'; }
        else { return undefined; }
    }

    /**
     * Returns whether the current browser is IE or not, for when
     * all you care about is whether someone is (still?!) using IE or not
     * @returns {Boolean}
     */
    get screwIE () {
        return this._isIE;
    }

    /**
     * Returns whether the device is mobile or not
     * @returns {Boolean}
     */
    get mobile () {
        return this._isMobile;
    }

    /**
     * REturns whether the device supports touch or not
     * @returns {Boolean}
     */
    get supportsTouch () {
        return this._hasTouch;
    }

}

export default Browser;
