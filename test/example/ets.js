// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({4:[function(require,module,exports) {
module.exports = {
  appid: '',
  eventid: '',
  api: 'https://s.mgzf.com/batch',
  events: [],
  log: false
};
},{}],3:[function(require,module,exports) {
const prefix = '_ets_';
function getNetWorkInfo(fn) {
  wx.getNetworkType({
    success: res => {
      typeof fn === 'function' && fn(res.networkType);
    },
    fail: res => {
      typeof fn === 'function' && fn(res);
    }
  });
}

function getSystemInfo() {
  var sys = wx.getSystemInfoSync();
  return {
    model: sys.model,
    scl: sys.pixelRatio,
    scr: sys.windowWidth + 'x' + sys.windowHeight,
    lang: sys.language,
    version: sys.version,
    system: sys.system,
    platform: sys.platform
  };
}

function setSID() {
  try {
    let sid = 's' + getRandom();
    wx.setStorageSync(prefix + 'sid', sid);
    return sid;
  } catch (e) {
    console.error('set session id error:' + e);
  }
}
function getSID() {
  try {
    return wx.getStorageSync(prefix + 'sid');
  } catch (e) {
    console.error('get session id error:' + e);
  }
}

function setUID() {
  try {
    let uid = 'u' + getRandom();
    wx.setStorageSync(prefix + 'uid', uid);
    return uid;
  } catch (e) {
    console.error('set user id error:' + e);
  }
}
function getUID() {
  try {
    return wx.getStorageSync(prefix + 'uid');
  } catch (e) {
    console.error('get user id error:' + e);
  }
}

function getRandom(a) {
  for (var b = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], c = 10; c > 1; c--) {
    var d = Math.floor(10 * Math.random());
    var e = b[d];
    b[d] = b[c - 1];
    b[c - 1] = e;
  }
  for (c = d = 0; c < 5; c++) d = 10 * d + b[c];
  return (a || '') + (d + '' + +new Date());
}

function getRoutePath() {
  try {
    let pages = getCurrentPages();
    let path = '/';
    pages.length > 0 && (path = pages.pop().__route__);
    return path;
  } catch (e) {
    console.log('get current page path error:' + e);
  }
}

function getBasicInfo() {
  let system = getSystemInfo();
  getNetWorkInfo(type => {
    try {
      wx.setStorageSync(this.prefix + 'network', type);
    } catch (e) {
      console.error(e);
    }
  });
  system.network = wx.getStorageSync(this.prefix + 'network');
  return {
    system
  };
}

module.exports = {
  setSID,
  getSID,
  setUID,
  getUID,
  getRoutePath,
  getBasicInfo
};
},{}],11:[function(require,module,exports) {
class Proxy {
  constructor(observer) {
    this.originApp = App;
    this.originPage = Page;
    this.defaultPageHandlers = {};
    this.defaultAppHandlers = {};
    this.lifeCircles = {
      App: ['onLaunch', 'onShow', 'onError'],
      Page: ['onLoad', 'onShow', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onTabItemTap']
    };
    this.eventType = ['tap'];

    this.observer = observer;
    this.init();
  }
  hook(name, handler) {
    var $this = this;
    return function () {
      var args = arguments ? arguments[0] : null;
      if (args && args.currentTarget && $this.eventType.indexOf(args.type) >= 0) {
        try {
          $this.observer.addEventListener(name, args);
        } catch (ex) {
          console.error(ex);
        }
      }
      handler(args);
      return args;
    };
  }
  intercept(args) {
    Object.keys(args).forEach(key => {
      if (typeof args[key] === 'function') {
        args[key] = this.hook(key, args[key]);
      }
    });
    return args;
  }
  ETSPage(pageArgs) {
    pageArgs._ets_page = true;
    console.log(pageArgs, 'page');
    this.originPage(this.intercept(pageArgs));
  }
  ETSApp(appArgs) {
    console.log(appArgs, 'app');
    this.originApp(appArgs);
  }
  init() {
    let $this = this;
    Page = function (...args) {
      return $this.ETSPage(args[0]);
    };
    App = function (...args) {
      return $this.ETSApp(args[0]);
    };
  }
}
module.exports = Proxy;
},{}],5:[function(require,module,exports) {
const Proxy = require('./proxy');
class Observer {
  constructor(ets) {
    this.ets = ets;
    this.proxy = new Proxy(this);
    this.proxy.init();
    //TODO
  }
  addEventListener(name, args) {
    if (args.type === 'tap') {
      this.trackTap(name);
    }
  }
  addPageListener() {}
  trackTap(name, args) {
    console.log('track tap from ets', name, args);
  }
}
module.exports = Observer;
},{"./proxy":11}],1:[function(require,module,exports) {
var ETS_CONFIG = require('./config');
const util = require('./util');
const Observer = require('./observer');

class ETS {
  constructor(options) {
    this.$config = ETS_CONFIG;
    this.prefix = '_ets_';

    Object.assign(this.$config, options);
    this.observer = new Observer(this);
  }
  get sid() {
    return util.getSID() || util.setSID();
  }
  get uid() {
    return util.getUID() || util.setUID();
  }
  init() {}
}
module.exports = ETS;
},{"./config":4,"./util":3,"./observer":5}]},{},[1], null)