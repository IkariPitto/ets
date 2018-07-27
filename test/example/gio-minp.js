"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Uploader = function () {
  function Uploader(t, e) {
    _classCallCheck(this, Uploader);

    this.host = "https://wxapi.growingio.com", this.messageQueue = [], this.uploadingQueue = [], this.uploadTimer = null, this.projectId = t, this.appId = e, this.url = this.host + "/projects/" + this.projectId + "/apps/" + this.appId + "/collect";
  }

  _createClass(Uploader, [{
    key: "setHost",
    value: function setHost(t) {
      0 != t.indexOf("http") && (this.host = "https://" + t), this.url = this.host + "/projects/" + this.projectId + "/apps/" + this.appId + "/collect";
    }
  }, {
    key: "upload",
    value: function upload(t) {
      var _this = this;

      this.messageQueue.push(t), this.uploadTimer || (this.uploadTimer = setTimeout(function () {
        _this._flush(), _this.uploadTimer = null;
      }, 1e3));
    }
  }, {
    key: "forceFlush",
    value: function forceFlush() {
      this.uploadTimer && (clearTimeout(this.uploadTimer), this.uploadTimer = null), this._flush();
    }
  }, {
    key: "_flush",
    value: function _flush() {
      var _this2 = this;

      this.uploadingQueue = this.messageQueue.slice(), this.messageQueue = [], this.uploadingQueue.length > 0 && wx.request({
        url: this.url + "?stm=" + Date.now(),
        header: {},
        method: "POST",
        data: this.uploadingQueue,
        success: function success() {
          _this2.messageQueue.length > 0 && _this2._flush();
        },
        fail: function fail() {
          _this2.messageQueue = _this2.uploadingQueue.concat(_this2.messageQueue);
        }
      });
    }
  }]);

  return Uploader;
}();

var Utils = {
  sdkVer: "0.6",
  devVer: 1,
  guid: function guid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) {
      var e = 16 * Math.random() | 0;
      return ("x" == t ? e : 3 & e | 8).toString(16);
    });
  },
  getScreenHeight: function getScreenHeight(t) {
    return Math.round(t.screenHeight * t.pixelRatio);
  },
  getScreenWidth: function getScreenWidth(t) {
    return Math.round(t.screenWidth * t.pixelRatio);
  },
  getOS: function getOS(t) {
    if (t) {
      var e = t.toLowerCase();
      return -1 != e.indexOf("android") ? "Weixin-Android" : -1 != e.indexOf("ios") ? "Weixin-iOS" : t;
    }
  },
  getOSV: function getOSV(t) {
    return "Weixin " + t;
  },
  isEmpty: function isEmpty(t) {
    for (var e in t) {
      if (t.hasOwnProperty(e)) return !1;
    }return !0;
  }
};

var Page$1 = function () {
  function Page$1() {
    _classCallCheck(this, Page$1);

    this.queries = {};
  }

  _createClass(Page$1, [{
    key: "touch",
    value: function touch(t) {
      this.path = t.route, this.time = Date.now(), this.query = this.queries[t.route] ? this.queries[t.route] : void 0;
    }
  }, {
    key: "addQuery",
    value: function addQuery(t, e) {
      this.queries[t.route] = e ? this._getQuery(e) : null;
    }
  }, {
    key: "_getQuery",
    value: function _getQuery(t) {
      return Object.keys(t).map(function (e) {
        return e + "=" + t[e];
      }).join("&");
    }
  }]);

  return Page$1;
}();

var Observer = function () {
  function Observer(t) {
    _classCallCheck(this, Observer);

    this.growingio = t, this.weixin = t.weixin, this.currentPage = new Page$1(), this.scene = null, this.sessionId = null, this.cs1 = null, this.lastPageEvent = void 0, this.isOnShareAppMessage = !1, this.CLICK_TYPE = {
      tap: "clck",
      longpress: "lngprss"
    };
  }

  _createClass(Observer, [{
    key: "setUserId",
    value: function setUserId(t) {
      var e = t + "";
      e && 100 > e.length && (this.cs1 = e, this.lastPageEvent && this._sendEvent(this.lastPageEvent));
    }
  }, {
    key: "clearUserId",
    value: function clearUserId() {
      this.cs1 = null;
    }
  }, {
    key: "appListener",
    value: function appListener(t, e, i) {
      this.isOnShareAppMessage || (this.growingio.debug && console.log("App.", e, Date.now()), "onShow" == e ? (this.sessionId = Utils.guid(), this.lastPageEvent = void 0, this.sendVisitEvent(i)) : "onHide" == e ? (this.growingio.forceFlush(), this.weixin.syncStorage(), this.isOnShareAppMessage || this.sendVisitCloseEvent()) : "onError" == e && this.sendErrorEvent(i));
    }
  }, {
    key: "pageListener",
    value: function pageListener(t, e, i) {
      //console.log(t, e, i)
      if (this.growingio.debug && console.log("Page.", t.route, "#", e, Date.now()), "onShow" === e) this.isOnShareAppMessage ? this.isOnShareAppMessage = !1 : (this.currentPage.touch(t), this.sendPage(t));else if ("onLoad" === e) {
        Utils.isEmpty(s = i[0]) || this.currentPage.addQuery(t, s);
      } else if ("onShareAppMessage" === e) {
        var s = null,
            n = null;
        2 > i.length ? 1 === i.length && (i[0].from ? s = i[0] : i[0].title && (n = i[0])) : (s = i[0], n = i[1]), this.isOnShareAppMessage = !0, this.sendPageShare(t, s, n);
      } else if ("onTabItemTap" === e) {
        this.sendTabClick(i[0]);
      }
    }
  }, {
    key: "actionListener",
    value: function actionListener(t, e) {
      this.growingio.debug && console.log("Click on ", e, Date.now()), "tap" === t.type || "longpress" === t.type ? this.sendClick(t, e) : "change" !== t.type && "confirm" !== t.type || this.sendChange(t, e);
    }
  }, {
    key: "track",
    value: function track(t, e) {
      if (null !== t && void 0 !== t && 0 !== t.length) {
        var i = {
          t: "cstm",
          ptm: this.currentPage.time,
          p: this.currentPage.path,
          q: this.currentPage.query,
          n: t
        };
        null !== e && "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && (i.var = e), this._sendEvent(i);
      }
    }
  }, {
    key: "identify",
    value: function identify(t, e) {
      void 0 !== t && 0 !== t.length && (this.growingio.login(t), this._sendEvent({
        t: "vstr",
        var: {
          openid: t,
          unionid: e
        }
      }));
    }
  }, {
    key: "setVisitor",
    value: function setVisitor(t) {
      this._sendEvent({
        t: "vstr",
        var: t
      });
    }
  }, {
    key: "setUser",
    value: function setUser(t) {
      this._sendEvent({
        t: "ppl",
        var: t
      });
    }
  }, {
    key: "setPage",
    value: function setPage(t) {
      this._sendEvent({
        t: "pvar",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query,
        var: t
      });
    }
  }, {
    key: "setEvar",
    value: function setEvar(t) {
      this._sendEvent({
        t: "evar",
        var: t
      });
    }
  }, {
    key: "sendVisitEvent",
    value: function sendVisitEvent(t) {
      var _this3 = this;

      var e = this.weixin.systemInfo,
          i = {
        t: "vst",
        tm: Date.now(),
        av: Utils.sdkVer,
        db: e.brand,
        dm: e.model.replace(/<.*>/, ""),
        sh: Utils.getScreenHeight(e),
        sw: Utils.getScreenWidth(e),
        os: Utils.getOS(e.platform),
        osv: Utils.getOSV(e.version),
        l: e.language
      };
      if (this.growingio.appVer && (i.cv = this.growingio.appVer + ""), t.length > 0) {
        var s = t[0];
        i.p = s.path, Utils.isEmpty(s.query) || (i.q = this.currentPage._getQuery(s.query)), i.ch = "scn:" + s.scene, s.referrerInfo && s.referrerInfo.appId && (i.rf = s.referrerInfo.appId), this.scene = s.scene;
      }
      this.weixin.requestLocation().then(function () {
        null != _this3.weixin.location && (i.lat = _this3.weixin.location.latitude, i.lng = _this3.weixin.location.longitude), _this3._sendEvent(i);
      });
    }
  }, {
    key: "sendVisitCloseEvent",
    value: function sendVisitCloseEvent() {
      this._sendEvent({
        t: "cls",
        p: this.currentPage.path,
        q: this.currentPage.query
      });
    }
  }, {
    key: "sendErrorEvent",
    value: function sendErrorEvent(t) {
      if (t.length > 0) {
        var e = t[0].split("\n");
        if (e.length > 1) {
          var _t = e[1].split(";");
          if (_t.length > 1) {
            var i = _t[1].match(/at ([^ ]+) page (.*) function/),
                _s = {
              key: e[0],
              error: _t[0]
            };
            i.length > 2 && (_s.page = i[1], _s.function = i[2]), this._sendEvent({
              t: "cstm",
              ptm: this.currentPage.time,
              p: this.currentPage.path,
              q: this.currentPage.query,
              n: "onError",
              var: _s
            });
          }
        }
      }
    }
  }, {
    key: "sendPage",
    value: function sendPage(t) {
      var e = {
        t: "page",
        tm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query
      };
      e.rp = this.lastPageEvent ? this.lastPageEvent.p : this.scene ? "scn:" + this.scene : null, t.data && t.data.pvar && (e.var = t.data.pvar);
      var i = this.weixin.getPageTitle(t);
      i.length > 0 && (e.tl = i), this._sendEvent(e), this.lastPageEvent = e;
    }
  }, {
    key: "sendPageShare",
    value: function sendPageShare(t, e, i) {
      this._sendEvent({
        t: "cstm",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query,
        n: "onShareAppMessage",
        var: {
          from: e ? e.from : void 0,
          target: e && e.target ? e.target.id : void 0,
          title: i ? i.title : void 0,
          path: i ? i.path : void 0
        }
      });
    }
  }, {
    key: "sendClick",
    value: function sendClick(t, e) {
      var i = {
        t: this.CLICK_TYPE[t.type],
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query
      },
          s = t.currentTarget,
          n = {
        x: s.id + "#" + e
      };
      s.dataset.title ? n.v = s.dataset.title : s.dataset.src && (n.h = s.dataset.src), void 0 !== s.dataset.index && (n.idx = s.dataset.index), i.e = [n], this._sendEvent(i);
    }
  }, {
    key: "sendChange",
    value: function sendChange(t, e) {
      var i = {
        t: "chng",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query
      },
          s = t.currentTarget,
          n = {
        x: s.id + "#" + e
      };
      if ("change" === t.type || "confirm" === t.type && s.dataset.growingTrack) {
        if (!t.detail.value || 0 === t.detail.value.length) return;
        "string" == typeof t.detail.value ? n.v = t.detail.value : "[object Array]" === Object.prototype.toString.call(t.detail.value) && (n.v = t.detail.value.join(","));
      }
      i.e = [n], this._sendEvent(i);
    }
  }, {
    key: "sendTabClick",
    value: function sendTabClick(t) {
      this._sendEvent({
        t: "clck",
        ptm: this.currentPage.time,
        p: this.currentPage.path,
        q: this.currentPage.query,
        elem: [{
          x: "#onTabItemTap",
          v: t.text,
          idx: t.index,
          h: t.pagePath
        }]
      });
    }
  }, {
    key: "_sendEvent",
    value: function _sendEvent(t) {
      t.u = this.weixin.uid, t.s = this.sessionId, t.tm = t.tm || Date.now(), t.d = this.growingio.appId, t.b = "MinP", null !== this.cs1 && (t.cs1 = this.cs1), this.growingio.upload(t);
    }
  }]);

  return Observer;
}();

var Weixin = function () {
  function Weixin(t) {
    _classCallCheck(this, Weixin);

    this._location = null, this._systemInfo = null, this._uid = wx.getStorageSync("_growing_uid_"), this._uid && 36 !== this._uid.length && (t.forceLogin = !1), this._esid = wx.getStorageSync("_growing_esid_");
  }

  _createClass(Weixin, [{
    key: "syncStorage",
    value: function syncStorage() {
      wx.getStorageSync("_growing_uid_") || wx.setStorageSync("_growing_uid_", this._uid);
    }
  }, {
    key: "requestLocation",
    value: function requestLocation() {
      var _this4 = this;

      return new Promise(function (t) {
        _this4._getSetting().then(function (e) {
          if (!e || !e.authSetting["scope.userLocation"]) return t(null);
          _this4._getLocation().then(function (e) {
            return _this4._location = e, t(e);
          });
        });
      });
    }
  }, {
    key: "getPageTitle",
    value: function getPageTitle(t) {
      var e = "";
      try {
        if (t.data.title && t.data.title.length > 0 && (e = t.data.title), 0 === e.length && __wxConfig) {
          if (__wxConfig.tabBar) {
            var i = __wxConfig.tabBar.list.find(function (e) {
              return e.pathPath == t.route || e.pagePath == t.route + ".html";
            });
            i && i.text && (e = i.text);
          }
          if (0 == e.length) {
            var s = __wxConfig.page[t.route] || __wxConfig.page[t.route + ".html"];
            e = s ? s.window.navigationBarTitleText : __wxConfig.global.window.navigationBarTitleText;
          }
        }
      } catch (t) {}
      return e;
    }
  }, {
    key: "_getSetting",
    value: function _getSetting() {
      return new Promise(function (t, e) {
        wx.getSetting({
          success: t,
          fail: e
        });
      });
    }
  }, {
    key: "_getLocation",
    value: function _getLocation() {
      return new Promise(function (t, e) {
        wx.getLocation({
          success: t,
          fail: e
        });
      });
    }
  }, {
    key: "location",
    get: function get() {
      return this._location;
    }
  }, {
    key: "systemInfo",
    get: function get() {
      return null == this._systemInfo && (this._systemInfo = wx.getSystemInfoSync()), this._systemInfo;
    }
  }, {
    key: "esid",
    set: function set(t) {
      this._esid = t, wx.setStorageSync("_growing_esid_", this._esid);
    },
    get: function get() {
      return this._esid || (this._esid = 1), this._esid;
    }
  }, {
    key: "uid",
    set: function set(t) {
      this._uid = t, wx.setStorageSync("_growing_uid_", this._uid);
    },
    get: function get() {
      return this._uid || (this.uid = Utils.guid()), this._uid;
    }
  }]);

  return Weixin;
}();

var VdsInstrumentAgent = {
  defaultPageCallbacks: {},
  defaultAppCallbacks: {},
  appHandlers: ["onShow", "onHide", "onError"],
  pageHandlers: ["onLoad", "onShow", "onShareAppMessage", "onTabItemTap"],
  actionEventTypes: ["tap", "longpress", "change", "confirm"],
  originalPage: Page,
  originalApp: App,
  hook: function hook(t, e) {
    return function () {
      var i,
          s = arguments ? arguments[0] : void 0;
      if (s && s.currentTarget && -1 != VdsInstrumentAgent.actionEventTypes.indexOf(s.type)) try {
        VdsInstrumentAgent.observer.actionListener(s, t);
      } catch (t) {
        console.error(t);
      }
      if (this._growing_page_ && -1 !== ["onShow", "onLoad", "onTabItemTap"].indexOf(t) || (i = e.apply(this, arguments)), this._growing_app_ && -1 != VdsInstrumentAgent.appHandlers.indexOf(t)) try {
        VdsInstrumentAgent.defaultAppCallbacks[t].apply(this, arguments);
      } catch (t) {
        console.error(t);
      }
      if (this._growing_page_ && -1 != VdsInstrumentAgent.pageHandlers.indexOf(t)) {
        var n = Array.prototype.slice.call(arguments);
        i && n.push(i);
        try {
          VdsInstrumentAgent.defaultPageCallbacks[t].apply(this, n);
        } catch (t) {
          console.error(t);
        }-1 != ["onShow", "onLoad", "onTabItemTap"].indexOf(t) && (i = e.apply(this, arguments));
      }
      return i;
    };
  },
  instrument: function instrument(t) {
    for (var e in t) {
      "function" == typeof t[e] && (t[e] = this.hook(e, t[e]));
    }return t._growing_app_ && VdsInstrumentAgent.appHandlers.map(function (e) {
      t[e] || (t[e] = VdsInstrumentAgent.defaultAppCallbacks[e]);
    }), t._growing_page_ && VdsInstrumentAgent.pageHandlers.map(function (e) {
      t[e] || (t[e] = VdsInstrumentAgent.defaultPageCallbacks[e]);
    }), t;
  },
  GrowingPage: function GrowingPage(t) {
    t._growing_page_ = !0, VdsInstrumentAgent.originalPage(VdsInstrumentAgent.instrument(t));
  },
  GrowingApp: function GrowingApp(t) {
    t._growing_app_ = !0, VdsInstrumentAgent.originalApp(VdsInstrumentAgent.instrument(t));
  },
  initInstrument: function initInstrument(t) {
    //console.log('initInstrument', t)
    VdsInstrumentAgent.observer = t, VdsInstrumentAgent.pageHandlers.forEach(function (t) {
      VdsInstrumentAgent.defaultPageCallbacks[t] = function () {
        this.__route__ && VdsInstrumentAgent.observer.pageListener(this, t, arguments);
      };
    }), VdsInstrumentAgent.appHandlers.forEach(function (t) {
      VdsInstrumentAgent.defaultAppCallbacks[t] = function () {
        VdsInstrumentAgent.observer.appListener(this, t, arguments);
      };
    }), Page = function Page() {
      return VdsInstrumentAgent.GrowingPage(arguments[0]);
    }, App = function App() {
      return VdsInstrumentAgent.GrowingApp(arguments[0]);
    };
  }
};

var GrowingIO = function () {
  function GrowingIO() {
    _classCallCheck(this, GrowingIO);

    this.uploadingMessages = [];
  }

  _createClass(GrowingIO, [{
    key: "init",
    value: function init(t, e) {
      var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      this.projectId = t, this.appId = e, this.appVer = i.version, this.debug = i.debug || !1, this.forceLogin = i.forceLogin || !1, this.weixin = new Weixin(this), this.esid = this.weixin.esid, this.uploader = new Uploader(this.projectId, this.appId), this.observer = new Observer(this), this._start();
      //console.log(this.observer)
    }
  }, {
    key: "setHost",
    value: function setHost(t) {
      this.uploader.setHost(t);
    }
  }, {
    key: "login",
    value: function login(t) {
      if (this.forceLogin) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (this.weixin.uid = t, this.forceLogin = !1, this.uploadingMessages)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;
            e.u = t, this._upload(e);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  }, {
    key: "upload",
    value: function upload(t) {
      this.forceLogin ? this.uploadingMessages.push(t) : this._upload(t);
    }
  }, {
    key: "forceFlush",
    value: function forceFlush() {
      this.weixin.esid = this.esid, this.uploader.forceFlush();
    }
  }, {
    key: "proxy",
    value: function proxy(t, e) {
      try {
        this.observer && this.observer[t] && this.observer[t].apply(this.observer, e);
      } catch (t) {
        console.error(t);
      }
    }
  }, {
    key: "_start",
    value: function _start() {
      VdsInstrumentAgent.initInstrument(this.observer);
    }
  }, {
    key: "_upload",
    value: function _upload(t) {
      t.esid = this.esid++, this.debug && console.info("generate new event", JSON.stringify(t, 0, 2)), this.uploader.upload(t);
    }
  }]);

  return GrowingIO;
}();

var growingio = new GrowingIO(),
    gio = function gio() {
  var t = arguments[0];
  if (t) {
    var e = 2 > arguments.length ? [] : [].slice.call(arguments, 1);
    // console.log(t, e)
    if ("init" === t) {
      if (2 > e.length) return void console.log("初始化 GrowingIO SDK 失败。请使用 gio('init', '你的GrowingIO项目ID', '你的微信APP_ID', options);");
      growingio.init(e[0], e[1], e[2]);
    } else growingio.proxy(t, e);
  }
};
console.log("init growingio..."), module.exports = gio;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdpby1taW5wLmpzIl0sIm5hbWVzIjpbIlVwbG9hZGVyIiwidCIsImUiLCJob3N0IiwibWVzc2FnZVF1ZXVlIiwidXBsb2FkaW5nUXVldWUiLCJ1cGxvYWRUaW1lciIsInByb2plY3RJZCIsImFwcElkIiwidXJsIiwiaW5kZXhPZiIsInB1c2giLCJzZXRUaW1lb3V0IiwiX2ZsdXNoIiwiY2xlYXJUaW1lb3V0Iiwic2xpY2UiLCJsZW5ndGgiLCJ3eCIsInJlcXVlc3QiLCJEYXRlIiwibm93IiwiaGVhZGVyIiwibWV0aG9kIiwiZGF0YSIsInN1Y2Nlc3MiLCJmYWlsIiwiY29uY2F0IiwiVXRpbHMiLCJzZGtWZXIiLCJkZXZWZXIiLCJndWlkIiwicmVwbGFjZSIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsImdldFNjcmVlbkhlaWdodCIsInJvdW5kIiwic2NyZWVuSGVpZ2h0IiwicGl4ZWxSYXRpbyIsImdldFNjcmVlbldpZHRoIiwic2NyZWVuV2lkdGgiLCJnZXRPUyIsInRvTG93ZXJDYXNlIiwiZ2V0T1NWIiwiaXNFbXB0eSIsImhhc093blByb3BlcnR5IiwiUGFnZSQxIiwicXVlcmllcyIsInBhdGgiLCJyb3V0ZSIsInRpbWUiLCJxdWVyeSIsIl9nZXRRdWVyeSIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJqb2luIiwiT2JzZXJ2ZXIiLCJncm93aW5naW8iLCJ3ZWl4aW4iLCJjdXJyZW50UGFnZSIsInNjZW5lIiwic2Vzc2lvbklkIiwiY3MxIiwibGFzdFBhZ2VFdmVudCIsImlzT25TaGFyZUFwcE1lc3NhZ2UiLCJDTElDS19UWVBFIiwidGFwIiwibG9uZ3ByZXNzIiwiX3NlbmRFdmVudCIsImkiLCJkZWJ1ZyIsImNvbnNvbGUiLCJsb2ciLCJzZW5kVmlzaXRFdmVudCIsImZvcmNlRmx1c2giLCJzeW5jU3RvcmFnZSIsInNlbmRWaXNpdENsb3NlRXZlbnQiLCJzZW5kRXJyb3JFdmVudCIsInRvdWNoIiwic2VuZFBhZ2UiLCJzIiwiYWRkUXVlcnkiLCJuIiwiZnJvbSIsInRpdGxlIiwic2VuZFBhZ2VTaGFyZSIsInNlbmRUYWJDbGljayIsInR5cGUiLCJzZW5kQ2xpY2siLCJzZW5kQ2hhbmdlIiwicHRtIiwicCIsInEiLCJ2YXIiLCJsb2dpbiIsIm9wZW5pZCIsInVuaW9uaWQiLCJzeXN0ZW1JbmZvIiwidG0iLCJhdiIsImRiIiwiYnJhbmQiLCJkbSIsIm1vZGVsIiwic2giLCJzdyIsIm9zIiwicGxhdGZvcm0iLCJvc3YiLCJ2ZXJzaW9uIiwibCIsImxhbmd1YWdlIiwiYXBwVmVyIiwiY3YiLCJjaCIsInJlZmVycmVySW5mbyIsInJmIiwicmVxdWVzdExvY2F0aW9uIiwidGhlbiIsImxvY2F0aW9uIiwibGF0IiwibGF0aXR1ZGUiLCJsbmciLCJsb25naXR1ZGUiLCJzcGxpdCIsIm1hdGNoIiwia2V5IiwiZXJyb3IiLCJwYWdlIiwiZnVuY3Rpb24iLCJycCIsInB2YXIiLCJnZXRQYWdlVGl0bGUiLCJ0bCIsInRhcmdldCIsImlkIiwiY3VycmVudFRhcmdldCIsIngiLCJkYXRhc2V0IiwidiIsInNyYyIsImgiLCJpbmRleCIsImlkeCIsImdyb3dpbmdUcmFjayIsImRldGFpbCIsInZhbHVlIiwicHJvdG90eXBlIiwiY2FsbCIsImVsZW0iLCJ0ZXh0IiwicGFnZVBhdGgiLCJ1IiwidWlkIiwiZCIsImIiLCJ1cGxvYWQiLCJXZWl4aW4iLCJfbG9jYXRpb24iLCJfc3lzdGVtSW5mbyIsIl91aWQiLCJnZXRTdG9yYWdlU3luYyIsImZvcmNlTG9naW4iLCJfZXNpZCIsInNldFN0b3JhZ2VTeW5jIiwiUHJvbWlzZSIsIl9nZXRTZXR0aW5nIiwiYXV0aFNldHRpbmciLCJfZ2V0TG9jYXRpb24iLCJfX3d4Q29uZmlnIiwidGFiQmFyIiwibGlzdCIsImZpbmQiLCJwYXRoUGF0aCIsIndpbmRvdyIsIm5hdmlnYXRpb25CYXJUaXRsZVRleHQiLCJnbG9iYWwiLCJnZXRTZXR0aW5nIiwiZ2V0TG9jYXRpb24iLCJnZXRTeXN0ZW1JbmZvU3luYyIsIlZkc0luc3RydW1lbnRBZ2VudCIsImRlZmF1bHRQYWdlQ2FsbGJhY2tzIiwiZGVmYXVsdEFwcENhbGxiYWNrcyIsImFwcEhhbmRsZXJzIiwicGFnZUhhbmRsZXJzIiwiYWN0aW9uRXZlbnRUeXBlcyIsIm9yaWdpbmFsUGFnZSIsIlBhZ2UiLCJvcmlnaW5hbEFwcCIsIkFwcCIsImhvb2siLCJhcmd1bWVudHMiLCJvYnNlcnZlciIsImFjdGlvbkxpc3RlbmVyIiwiX2dyb3dpbmdfcGFnZV8iLCJhcHBseSIsIl9ncm93aW5nX2FwcF8iLCJBcnJheSIsImluc3RydW1lbnQiLCJHcm93aW5nUGFnZSIsIkdyb3dpbmdBcHAiLCJpbml0SW5zdHJ1bWVudCIsImZvckVhY2giLCJfX3JvdXRlX18iLCJwYWdlTGlzdGVuZXIiLCJhcHBMaXN0ZW5lciIsIkdyb3dpbmdJTyIsInVwbG9hZGluZ01lc3NhZ2VzIiwiZXNpZCIsInVwbG9hZGVyIiwiX3N0YXJ0Iiwic2V0SG9zdCIsIl91cGxvYWQiLCJpbmZvIiwiSlNPTiIsInN0cmluZ2lmeSIsImdpbyIsImluaXQiLCJwcm94eSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztJQUNNQSxRO0FBQ0osb0JBQVlDLENBQVosRUFBZUMsQ0FBZixFQUFrQjtBQUFBOztBQUNoQixTQUFLQyxJQUFMLEdBQVksNkJBQVosRUFBMkMsS0FBS0MsWUFBTCxHQUFvQixFQUEvRCxFQUFtRSxLQUFLQyxjQUFMLEdBQXNCLEVBQXpGLEVBQTZGLEtBQUtDLFdBQUwsR0FBbUIsSUFBaEgsRUFBc0gsS0FBS0MsU0FBTCxHQUFpQk4sQ0FBdkksRUFBMEksS0FBS08sS0FBTCxHQUFhTixDQUF2SixFQUEwSixLQUFLTyxHQUFMLEdBQWMsS0FBS04sSUFBbkIsa0JBQW9DLEtBQUtJLFNBQXpDLGNBQTJELEtBQUtDLEtBQWhFLGFBQTFKO0FBQ0Q7Ozs7NEJBQ09QLEMsRUFBRztBQUNULFdBQUtBLEVBQUVTLE9BQUYsQ0FBVSxNQUFWLENBQUwsS0FBMkIsS0FBS1AsSUFBTCxHQUFZLGFBQWFG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XCJ1c2Ugc3RyaWN0XCI7XG5jbGFzcyBVcGxvYWRlciB7XG4gIGNvbnN0cnVjdG9yKHQsIGUpIHtcbiAgICB0aGlzLmhvc3QgPSBcImh0dHBzOi8vd3hhcGkuZ3Jvd2luZ2lvLmNvbVwiLCB0aGlzLm1lc3NhZ2VRdWV1ZSA9IFtdLCB0aGlzLnVwbG9hZGluZ1F1ZXVlID0gW10sIHRoaXMudXBsb2FkVGltZXIgPSBudWxsLCB0aGlzLnByb2plY3RJZCA9IHQsIHRoaXMuYXBwSWQgPSBlLCB0aGlzLnVybCA9IGAke3RoaXMuaG9zdH0vcHJvamVjdHMvJHt0aGlzLnByb2plY3RJZH0vYXBwcy8ke3RoaXMuYXBwSWR9L2NvbGxlY3RgXG4gIH1cbiAgc2V0SG9zdCh0KSB7XG4gICAgMCAhPSB0LmluZGV4T2YoXCJodHRwXCIpICYmICh0aGlzLmhvc3QgPSBcImh0dHBzOi8vXCIgKyB0KSwgdGhpcy51cmwgPSBgJHt0aGlzLmhvc3R9L3Byb2plY3RzLyR7dGhpcy5wcm9qZWN0SWR9L2FwcHMvJHt0aGlzLmFwcElkfS9jb2xsZWN0YFxuICB9XG4gIHVwbG9hZCh0KSB7XG4gICAgdGhpcy5tZXNzYWdlUXVldWUucHVzaCh0KSwgdGhpcy51cGxvYWRUaW1lciB8fCAodGhpcy51cGxvYWRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fZmx1c2goKSwgdGhpcy51cGxvYWRUaW1lciA9IG51bGxcbiAgICB9LCAxZTMpKVxuICB9XG4gIGZvcmNlRmx1c2goKSB7XG4gICAgdGhpcy51cGxvYWRUaW1lciAmJiAoY2xlYXJUaW1lb3V0KHRoaXMudXBsb2FkVGltZXIpLCB0aGlzLnVwbG9hZFRpbWVyID0gbnVsbCksIHRoaXMuX2ZsdXNoKClcbiAgfVxuICBfZmx1c2goKSB7XG4gICAgdGhpcy51cGxvYWRpbmdRdWV1ZSA9IHRoaXMubWVzc2FnZVF1ZXVlLnNsaWNlKCksIHRoaXMubWVzc2FnZVF1ZXVlID0gW10sIHRoaXMudXBsb2FkaW5nUXVldWUubGVuZ3RoID4gMCAmJiB3eC5yZXF1ZXN0KHtcbiAgICAgIHVybDogYCR7dGhpcy51cmx9P3N0bT0ke0RhdGUubm93KCl9YCxcbiAgICAgIGhlYWRlcjoge30sXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgZGF0YTogdGhpcy51cGxvYWRpbmdRdWV1ZSxcbiAgICAgIHN1Y2Nlc3M6ICgpID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlUXVldWUubGVuZ3RoID4gMCAmJiB0aGlzLl9mbHVzaCgpXG4gICAgICB9LFxuICAgICAgZmFpbDogKCkgPT4ge1xuICAgICAgICB0aGlzLm1lc3NhZ2VRdWV1ZSA9IHRoaXMudXBsb2FkaW5nUXVldWUuY29uY2F0KHRoaXMubWVzc2FnZVF1ZXVlKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbnZhciBVdGlscyA9IHtcbiAgc2RrVmVyOiBcIjAuNlwiLFxuICBkZXZWZXI6IDEsXG4gIGd1aWQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gXCJ4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHhcIi5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgZSA9IDE2ICogTWF0aC5yYW5kb20oKSB8IDA7XG4gICAgICByZXR1cm4gKFwieFwiID09IHQgPyBlIDogMyAmIGUgfCA4KS50b1N0cmluZygxNilcbiAgICB9KVxuICB9LFxuICBnZXRTY3JlZW5IZWlnaHQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQodC5zY3JlZW5IZWlnaHQgKiB0LnBpeGVsUmF0aW8pXG4gIH0sXG4gIGdldFNjcmVlbldpZHRoOiBmdW5jdGlvbiAodCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHQuc2NyZWVuV2lkdGggKiB0LnBpeGVsUmF0aW8pXG4gIH0sXG4gIGdldE9TOiBmdW5jdGlvbiAodCkge1xuICAgIGlmICh0KSB7XG4gICAgICB2YXIgZSA9IHQudG9Mb3dlckNhc2UoKTtcbiAgICAgIHJldHVybiAtMSAhPSBlLmluZGV4T2YoXCJhbmRyb2lkXCIpID8gXCJXZWl4aW4tQW5kcm9pZFwiIDogLTEgIT0gZS5pbmRleE9mKFwiaW9zXCIpID8gXCJXZWl4aW4taU9TXCIgOiB0XG4gICAgfVxuICB9LFxuICBnZXRPU1Y6IHQgPT4gYFdlaXhpbiAke3R9YCxcbiAgaXNFbXB0eTogdCA9PiB7XG4gICAgZm9yICh2YXIgZSBpbiB0KVxuICAgICAgaWYgKHQuaGFzT3duUHJvcGVydHkoZSkpIHJldHVybiAhMTtcbiAgICByZXR1cm4gITBcbiAgfVxufTtcbmNsYXNzIFBhZ2UkMSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucXVlcmllcyA9IHt9XG4gIH1cbiAgdG91Y2godCkge1xuICAgIHRoaXMucGF0aCA9IHQucm91dGUsIHRoaXMudGltZSA9IERhdGUubm93KCksIHRoaXMucXVlcnkgPSB0aGlzLnF1ZXJpZXNbdC5yb3V0ZV0gPyB0aGlzLnF1ZXJpZXNbdC5yb3V0ZV0gOiB2b2lkIDBcbiAgfVxuICBhZGRRdWVyeSh0LCBlKSB7XG4gICAgdGhpcy5xdWVyaWVzW3Qucm91dGVdID0gZSA/IHRoaXMuX2dldFF1ZXJ5KGUpIDogbnVsbFxuICB9XG4gIF9nZXRRdWVyeSh0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHQpLm1hcChlID0+IGAke2V9PSR7dFtlXX1gKS5qb2luKFwiJlwiKVxuICB9XG59XG5jbGFzcyBPYnNlcnZlciB7XG4gIGNvbnN0cnVjdG9yKHQpIHtcbiAgICB0aGlzLmdyb3dpbmdpbyA9IHQsIFxuICAgIHRoaXMud2VpeGluID0gdC53ZWl4aW4sIFxuICAgIHRoaXMuY3VycmVudFBhZ2UgPSBuZXcgUGFnZSQxLCBcbiAgICB0aGlzLnNjZW5lID0gbnVsbCwgXG4gICAgdGhpcy5zZXNzaW9uSWQgPSBudWxsLCBcbiAgICB0aGlzLmNzMSA9IG51bGwsIFxuICAgIHRoaXMubGFzdFBhZ2VFdmVudCA9IHZvaWQgMCwgXG4gICAgdGhpcy5pc09uU2hhcmVBcHBNZXNzYWdlID0gITEsIFxuICAgIHRoaXMuQ0xJQ0tfVFlQRSA9IHtcbiAgICAgIHRhcDogXCJjbGNrXCIsXG4gICAgICBsb25ncHJlc3M6IFwibG5ncHJzc1wiXG4gICAgfVxuICB9XG4gIHNldFVzZXJJZCh0KSB7XG4gICAgdmFyIGUgPSB0ICsgXCJcIjtcbiAgICBlICYmIDEwMCA+IGUubGVuZ3RoICYmICh0aGlzLmNzMSA9IGUsIHRoaXMubGFzdFBhZ2VFdmVudCAmJiB0aGlzLl9zZW5kRXZlbnQodGhpcy5sYXN0UGFnZUV2ZW50KSlcbiAgfVxuICBjbGVhclVzZXJJZCgpIHtcbiAgICB0aGlzLmNzMSA9IG51bGxcbiAgfVxuICBhcHBMaXN0ZW5lcih0LCBlLCBpKSB7XG4gICAgdGhpcy5pc09uU2hhcmVBcHBNZXNzYWdlIHx8ICh0aGlzLmdyb3dpbmdpby5kZWJ1ZyAmJiBjb25zb2xlLmxvZyhcIkFwcC5cIiwgZSwgRGF0ZS5ub3coKSksIFwib25TaG93XCIgPT0gZSA/ICh0aGlzLnNlc3Npb25JZCA9IFV0aWxzLmd1aWQoKSwgdGhpcy5sYXN0UGFnZUV2ZW50ID0gdm9pZCAwLCB0aGlzLnNlbmRWaXNpdEV2ZW50KGkpKSA6IFwib25IaWRlXCIgPT0gZSA/ICh0aGlzLmdyb3dpbmdpby5mb3JjZUZsdXNoKCksIHRoaXMud2VpeGluLnN5bmNTdG9yYWdlKCksIHRoaXMuaXNPblNoYXJlQXBwTWVzc2FnZSB8fCB0aGlzLnNlbmRWaXNpdENsb3NlRXZlbnQoKSkgOiBcIm9uRXJyb3JcIiA9PSBlICYmIHRoaXMuc2VuZEVycm9yRXZlbnQoaSkpXG4gIH1cbiAgcGFnZUxpc3RlbmVyKHQsIGUsIGkpIHtcbiAgICAvL2NvbnNvbGUubG9nKHQsIGUsIGkpXG4gICAgaWYgKFxuICAgICAgdGhpcy5ncm93aW5naW8uZGVidWcgJiYgXG4gICAgICBjb25zb2xlLmxvZyhcIlBhZ2UuXCIsIHQucm91dGUsIFwiI1wiLCBlLCBEYXRlLm5vdygpKSwgXCJvblNob3dcIiA9PT0gZSkgdGhpcy5pc09uU2hhcmVBcHBNZXNzYWdlID8gdGhpcy5pc09uU2hhcmVBcHBNZXNzYWdlID0gITEgOiAodGhpcy5jdXJyZW50UGFnZS50b3VjaCh0KSwgdGhpcy5zZW5kUGFnZSh0KSk7XG4gICAgZWxzZSBpZiAoXCJvbkxvYWRcIiA9PT0gZSkge1xuICAgICAgVXRpbHMuaXNFbXB0eShzID0gaVswXSkgfHwgdGhpcy5jdXJyZW50UGFnZS5hZGRRdWVyeSh0LCBzKVxuICAgIH0gZWxzZSBpZiAoXCJvblNoYXJlQXBwTWVzc2FnZVwiID09PSBlKSB7XG4gICAgICB2YXIgcyA9IG51bGwsXG4gICAgICAgIG4gPSBudWxsO1xuICAgICAgMiA+IGkubGVuZ3RoID8gMSA9PT0gaS5sZW5ndGggJiYgKGlbMF0uZnJvbSA/IHMgPSBpWzBdIDogaVswXS50aXRsZSAmJiAobiA9IGlbMF0pKSA6IChzID0gaVswXSwgbiA9IGlbMV0pLCB0aGlzLmlzT25TaGFyZUFwcE1lc3NhZ2UgPSAhMCwgdGhpcy5zZW5kUGFnZVNoYXJlKHQsIHMsIG4pXG4gICAgfSBlbHNlIGlmIChcIm9uVGFiSXRlbVRhcFwiID09PSBlKSB7XG4gICAgICB0aGlzLnNlbmRUYWJDbGljayhpWzBdKVxuICAgIH1cbiAgfVxuICBhY3Rpb25MaXN0ZW5lcih0LCBlKSB7XG4gICAgdGhpcy5ncm93aW5naW8uZGVidWcgJiYgY29uc29sZS5sb2coXCJDbGljayBvbiBcIiwgZSwgRGF0ZS5ub3coKSksIFwidGFwXCIgPT09IHQudHlwZSB8fCBcImxvbmdwcmVzc1wiID09PSB0LnR5cGUgPyB0aGlzLnNlbmRDbGljayh0LCBlKSA6IFwiY2hhbmdlXCIgIT09IHQudHlwZSAmJiBcImNvbmZpcm1cIiAhPT0gdC50eXBlIHx8IHRoaXMuc2VuZENoYW5nZSh0LCBlKVxuICB9XG4gIHRyYWNrKHQsIGUpIHtcbiAgICBpZiAobnVsbCAhPT0gdCAmJiB2b2lkIDAgIT09IHQgJiYgMCAhPT0gdC5sZW5ndGgpIHtcbiAgICAgIHZhciBpID0ge1xuICAgICAgICB0OiBcImNzdG1cIixcbiAgICAgICAgcHRtOiB0aGlzLmN1cnJlbnRQYWdlLnRpbWUsXG4gICAgICAgIHA6IHRoaXMuY3VycmVudFBhZ2UucGF0aCxcbiAgICAgICAgcTogdGhpcy5jdXJyZW50UGFnZS5xdWVyeSxcbiAgICAgICAgbjogdFxuICAgICAgfTtcbiAgICAgIG51bGwgIT09IGUgJiYgXCJvYmplY3RcIiA9PSB0eXBlb2YgZSAmJiAoaS52YXIgPSBlKSwgdGhpcy5fc2VuZEV2ZW50KGkpXG4gICAgfVxuICB9XG4gIGlkZW50aWZ5KHQsIGUpIHtcbiAgICB2b2lkIDAgIT09IHQgJiYgMCAhPT0gdC5sZW5ndGggJiYgKHRoaXMuZ3Jvd2luZ2lvLmxvZ2luKHQpLCB0aGlzLl9zZW5kRXZlbnQoe1xuICAgICAgdDogXCJ2c3RyXCIsXG4gICAgICB2YXI6IHtcbiAgICAgICAgb3BlbmlkOiB0LFxuICAgICAgICB1bmlvbmlkOiBlXG4gICAgICB9XG4gICAgfSkpXG4gIH1cbiAgc2V0VmlzaXRvcih0KSB7XG4gICAgdGhpcy5fc2VuZEV2ZW50KHtcbiAgICAgIHQ6IFwidnN0clwiLFxuICAgICAgdmFyOiB0XG4gICAgfSlcbiAgfVxuICBzZXRVc2VyKHQpIHtcbiAgICB0aGlzLl9zZW5kRXZlbnQoe1xuICAgICAgdDogXCJwcGxcIixcbiAgICAgIHZhcjogdFxuICAgIH0pXG4gIH1cbiAgc2V0UGFnZSh0KSB7XG4gICAgdGhpcy5fc2VuZEV2ZW50KHtcbiAgICAgIHQ6IFwicHZhclwiLFxuICAgICAgcHRtOiB0aGlzLmN1cnJlbnRQYWdlLnRpbWUsXG4gICAgICBwOiB0aGlzLmN1cnJlbnRQYWdlLnBhdGgsXG4gICAgICBxOiB0aGlzLmN1cnJlbnRQYWdlLnF1ZXJ5LFxuICAgICAgdmFyOiB0XG4gICAgfSlcbiAgfVxuICBzZXRFdmFyKHQpIHtcbiAgICB0aGlzLl9zZW5kRXZlbnQoe1xuICAgICAgdDogXCJldmFyXCIsXG4gICAgICB2YXI6IHRcbiAgICB9KVxuICB9XG4gIHNlbmRWaXNpdEV2ZW50KHQpIHtcbiAgICB2YXIgZSA9IHRoaXMud2VpeGluLnN5c3RlbUluZm8sXG4gICAgICBpID0ge1xuICAgICAgICB0OiBcInZzdFwiLFxuICAgICAgICB0bTogRGF0ZS5ub3coKSxcbiAgICAgICAgYXY6IFV0aWxzLnNka1ZlcixcbiAgICAgICAgZGI6IGUuYnJhbmQsXG4gICAgICAgIGRtOiBlLm1vZGVsLnJlcGxhY2UoLzwuKj4vLCBcIlwiKSxcbiAgICAgICAgc2g6IFV0aWxzLmdldFNjcmVlbkhlaWdodChlKSxcbiAgICAgICAgc3c6IFV0aWxzLmdldFNjcmVlbldpZHRoKGUpLFxuICAgICAgICBvczogVXRpbHMuZ2V0T1MoZS5wbGF0Zm9ybSksXG4gICAgICAgIG9zdjogVXRpbHMuZ2V0T1NWKGUudmVyc2lvbiksXG4gICAgICAgIGw6IGUubGFuZ3VhZ2VcbiAgICAgIH07XG4gICAgaWYgKHRoaXMuZ3Jvd2luZ2lvLmFwcFZlciAmJiAoaS5jdiA9IHRoaXMuZ3Jvd2luZ2lvLmFwcFZlciArIFwiXCIpLCB0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBzID0gdFswXTtcbiAgICAgIGkucCA9IHMucGF0aCwgVXRpbHMuaXNFbXB0eShzLnF1ZXJ5KSB8fCAoaS5xID0gdGhpcy5jdXJyZW50UGFnZS5fZ2V0UXVlcnkocy5xdWVyeSkpLCBpLmNoID0gYHNjbjoke3Muc2NlbmV9YCwgcy5yZWZlcnJlckluZm8gJiYgcy5yZWZlcnJlckluZm8uYXBwSWQgJiYgKGkucmYgPSBzLnJlZmVycmVySW5mby5hcHBJZCksIHRoaXMuc2NlbmUgPSBzLnNjZW5lXG4gICAgfVxuICAgIHRoaXMud2VpeGluLnJlcXVlc3RMb2NhdGlvbigpLnRoZW4oKCkgPT4ge1xuICAgICAgbnVsbCAhPSB0aGlzLndlaXhpbi5sb2NhdGlvbiAmJiAoaS5sYXQgPSB0aGlzLndlaXhpbi5sb2NhdGlvbi5sYXRpdHVkZSwgaS5sbmcgPSB0aGlzLndlaXhpbi5sb2NhdGlvbi5sb25naXR1ZGUpLCB0aGlzLl9zZW5kRXZlbnQoaSlcbiAgICB9KVxuICB9XG4gIHNlbmRWaXNpdENsb3NlRXZlbnQoKSB7XG4gICAgdGhpcy5fc2VuZEV2ZW50KHtcbiAgICAgIHQ6IFwiY2xzXCIsXG4gICAgICBwOiB0aGlzLmN1cnJlbnRQYWdlLnBhdGgsXG4gICAgICBxOiB0aGlzLmN1cnJlbnRQYWdlLnF1ZXJ5XG4gICAgfSlcbiAgfVxuICBzZW5kRXJyb3JFdmVudCh0KSB7XG4gICAgaWYgKHQubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGUgPSB0WzBdLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgaWYgKGUubGVuZ3RoID4gMSkge1xuICAgICAgICBsZXQgdCA9IGVbMV0uc3BsaXQoXCI7XCIpO1xuICAgICAgICBpZiAodC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgbGV0IGkgPSB0WzFdLm1hdGNoKC9hdCAoW14gXSspIHBhZ2UgKC4qKSBmdW5jdGlvbi8pLFxuICAgICAgICAgICAgcyA9IHtcbiAgICAgICAgICAgICAga2V5OiBlWzBdLFxuICAgICAgICAgICAgICBlcnJvcjogdFswXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBpLmxlbmd0aCA+IDIgJiYgKHMucGFnZSA9IGlbMV0sIHMuZnVuY3Rpb24gPSBpWzJdKSwgdGhpcy5fc2VuZEV2ZW50KHtcbiAgICAgICAgICAgIHQ6IFwiY3N0bVwiLFxuICAgICAgICAgICAgcHRtOiB0aGlzLmN1cnJlbnRQYWdlLnRpbWUsXG4gICAgICAgICAgICBwOiB0aGlzLmN1cnJlbnRQYWdlLnBhdGgsXG4gICAgICAgICAgICBxOiB0aGlzLmN1cnJlbnRQYWdlLnF1ZXJ5LFxuICAgICAgICAgICAgbjogXCJvbkVycm9yXCIsXG4gICAgICAgICAgICB2YXI6IHNcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNlbmRQYWdlKHQpIHtcbiAgICB2YXIgZSA9IHtcbiAgICAgIHQ6IFwicGFnZVwiLFxuICAgICAgdG06IHRoaXMuY3VycmVudFBhZ2UudGltZSxcbiAgICAgIHA6IHRoaXMuY3VycmVudFBhZ2UucGF0aCxcbiAgICAgIHE6IHRoaXMuY3VycmVudFBhZ2UucXVlcnlcbiAgICB9O1xuICAgIGUucnAgPSB0aGlzLmxhc3RQYWdlRXZlbnQgPyB0aGlzLmxhc3RQYWdlRXZlbnQucCA6IHRoaXMuc2NlbmUgPyBgc2NuOiR7dGhpcy5zY2VuZX1gIDogbnVsbCwgdC5kYXRhICYmIHQuZGF0YS5wdmFyICYmIChlLnZhciA9IHQuZGF0YS5wdmFyKTtcbiAgICB2YXIgaSA9IHRoaXMud2VpeGluLmdldFBhZ2VUaXRsZSh0KTtcbiAgICBpLmxlbmd0aCA+IDAgJiYgKGUudGwgPSBpKSwgdGhpcy5fc2VuZEV2ZW50KGUpLCB0aGlzLmxhc3RQYWdlRXZlbnQgPSBlXG4gIH1cbiAgc2VuZFBhZ2VTaGFyZSh0LCBlLCBpKSB7XG4gICAgdGhpcy5fc2VuZEV2ZW50KHtcbiAgICAgIHQ6IFwiY3N0bVwiLFxuICAgICAgcHRtOiB0aGlzLmN1cnJlbnRQYWdlLnRpbWUsXG4gICAgICBwOiB0aGlzLmN1cnJlbnRQYWdlLnBhdGgsXG4gICAgICBxOiB0aGlzLmN1cnJlbnRQYWdlLnF1ZXJ5LFxuICAgICAgbjogXCJvblNoYXJlQXBwTWVzc2FnZVwiLFxuICAgICAgdmFyOiB7XG4gICAgICAgIGZyb206IGUgPyBlLmZyb20gOiB2b2lkIDAsXG4gICAgICAgIHRhcmdldDogZSAmJiBlLnRhcmdldCA/IGUudGFyZ2V0LmlkIDogdm9pZCAwLFxuICAgICAgICB0aXRsZTogaSA/IGkudGl0bGUgOiB2b2lkIDAsXG4gICAgICAgIHBhdGg6IGkgPyBpLnBhdGggOiB2b2lkIDBcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHNlbmRDbGljayh0LCBlKSB7XG4gICAgdmFyIGkgPSB7XG4gICAgICAgIHQ6IHRoaXMuQ0xJQ0tfVFlQRVt0LnR5cGVdLFxuICAgICAgICBwdG06IHRoaXMuY3VycmVudFBhZ2UudGltZSxcbiAgICAgICAgcDogdGhpcy5jdXJyZW50UGFnZS5wYXRoLFxuICAgICAgICBxOiB0aGlzLmN1cnJlbnRQYWdlLnF1ZXJ5XG4gICAgICB9LFxuICAgICAgcyA9IHQuY3VycmVudFRhcmdldCxcbiAgICAgIG4gPSB7XG4gICAgICAgIHg6IGAke3MuaWR9IyR7ZX1gXG4gICAgICB9O1xuICAgIHMuZGF0YXNldC50aXRsZSA/IG4udiA9IHMuZGF0YXNldC50aXRsZSA6IHMuZGF0YXNldC5zcmMgJiYgKG4uaCA9IHMuZGF0YXNldC5zcmMpLCB2b2lkIDAgIT09IHMuZGF0YXNldC5pbmRleCAmJiAobi5pZHggPSBzLmRhdGFzZXQuaW5kZXgpLCBpLmUgPSBbbl0sIHRoaXMuX3NlbmRFdmVudChpKVxuICB9XG4gIHNlbmRDaGFuZ2UodCwgZSkge1xuICAgIHZhciBpID0ge1xuICAgICAgICB0OiBcImNobmdcIixcbiAgICAgICAgcHRtOiB0aGlzLmN1cnJlbnRQYWdlLnRpbWUsXG4gICAgICAgIHA6IHRoaXMuY3VycmVudFBhZ2UucGF0aCxcbiAgICAgICAgcTogdGhpcy5jdXJyZW50UGFnZS5xdWVyeVxuICAgICAgfSxcbiAgICAgIHMgPSB0LmN1cnJlbnRUYXJnZXQsXG4gICAgICBuID0ge1xuICAgICAgICB4OiBgJHtzLmlkfSMke2V9YFxuICAgICAgfTtcbiAgICBpZiAoXCJjaGFuZ2VcIiA9PT0gdC50eXBlIHx8IFwiY29uZmlybVwiID09PSB0LnR5cGUgJiYgcy5kYXRhc2V0Lmdyb3dpbmdUcmFjaykge1xuICAgICAgaWYgKCF0LmRldGFpbC52YWx1ZSB8fCAwID09PSB0LmRldGFpbC52YWx1ZS5sZW5ndGgpIHJldHVybjtcbiAgICAgIFwic3RyaW5nXCIgPT0gdHlwZW9mIHQuZGV0YWlsLnZhbHVlID8gbi52ID0gdC5kZXRhaWwudmFsdWUgOiBcIltvYmplY3QgQXJyYXldXCIgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0LmRldGFpbC52YWx1ZSkgJiYgKG4udiA9IHQuZGV0YWlsLnZhbHVlLmpvaW4oXCIsXCIpKVxuICAgIH1cbiAgICBpLmUgPSBbbl0sIHRoaXMuX3NlbmRFdmVudChpKVxuICB9XG4gIHNlbmRUYWJDbGljayh0KSB7XG4gICAgdGhpcy5fc2VuZEV2ZW50KHtcbiAgICAgIHQ6IFwiY2xja1wiLFxuICAgICAgcHRtOiB0aGlzLmN1cnJlbnRQYWdlLnRpbWUsXG4gICAgICBwOiB0aGlzLmN1cnJlbnRQYWdlLnBhdGgsXG4gICAgICBxOiB0aGlzLmN1cnJlbnRQYWdlLnF1ZXJ5LFxuICAgICAgZWxlbTogW3tcbiAgICAgICAgeDogXCIjb25UYWJJdGVtVGFwXCIsXG4gICAgICAgIHY6IHQudGV4dCxcbiAgICAgICAgaWR4OiB0LmluZGV4LFxuICAgICAgICBoOiB0LnBhZ2VQYXRoXG4gICAgICB9XVxuICAgIH0pXG4gIH1cbiAgX3NlbmRFdmVudCh0KSB7XG4gICAgdC51ID0gdGhpcy53ZWl4aW4udWlkLCB0LnMgPSB0aGlzLnNlc3Npb25JZCwgdC50bSA9IHQudG0gfHwgRGF0ZS5ub3coKSwgdC5kID0gdGhpcy5ncm93aW5naW8uYXBwSWQsIHQuYiA9IFwiTWluUFwiLCBudWxsICE9PSB0aGlzLmNzMSAmJiAodC5jczEgPSB0aGlzLmNzMSksIHRoaXMuZ3Jvd2luZ2lvLnVwbG9hZCh0KVxuICB9XG59XG5jbGFzcyBXZWl4aW4ge1xuICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgdGhpcy5fbG9jYXRpb24gPSBudWxsLCB0aGlzLl9zeXN0ZW1JbmZvID0gbnVsbCwgdGhpcy5fdWlkID0gd3guZ2V0U3RvcmFnZVN5bmMoXCJfZ3Jvd2luZ191aWRfXCIpLCB0aGlzLl91aWQgJiYgMzYgIT09IHRoaXMuX3VpZC5sZW5ndGggJiYgKHQuZm9yY2VMb2dpbiA9ICExKSwgdGhpcy5fZXNpZCA9IHd4LmdldFN0b3JhZ2VTeW5jKFwiX2dyb3dpbmdfZXNpZF9cIilcbiAgfVxuICBnZXQgbG9jYXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uXG4gIH1cbiAgZ2V0IHN5c3RlbUluZm8oKSB7XG4gICAgcmV0dXJuIG51bGwgPT0gdGhpcy5fc3lzdGVtSW5mbyAmJiAodGhpcy5fc3lzdGVtSW5mbyA9IHd4LmdldFN5c3RlbUluZm9TeW5jKCkpLCB0aGlzLl9zeXN0ZW1JbmZvXG4gIH1cbiAgc2V0IGVzaWQodCkge1xuICAgIHRoaXMuX2VzaWQgPSB0LCB3eC5zZXRTdG9yYWdlU3luYyhcIl9ncm93aW5nX2VzaWRfXCIsIHRoaXMuX2VzaWQpXG4gIH1cbiAgZ2V0IGVzaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VzaWQgfHwgKHRoaXMuX2VzaWQgPSAxKSwgdGhpcy5fZXNpZFxuICB9XG4gIHNldCB1aWQodCkge1xuICAgIHRoaXMuX3VpZCA9IHQsIHd4LnNldFN0b3JhZ2VTeW5jKFwiX2dyb3dpbmdfdWlkX1wiLCB0aGlzLl91aWQpXG4gIH1cbiAgZ2V0IHVpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdWlkIHx8ICh0aGlzLnVpZCA9IFV0aWxzLmd1aWQoKSksIHRoaXMuX3VpZFxuICB9XG4gIHN5bmNTdG9yYWdlKCkge1xuICAgIHd4LmdldFN0b3JhZ2VTeW5jKFwiX2dyb3dpbmdfdWlkX1wiKSB8fCB3eC5zZXRTdG9yYWdlU3luYyhcIl9ncm93aW5nX3VpZF9cIiwgdGhpcy5fdWlkKVxuICB9XG4gIHJlcXVlc3RMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UodCA9PiB7XG4gICAgICB0aGlzLl9nZXRTZXR0aW5nKCkudGhlbihlID0+IHtcbiAgICAgICAgaWYgKCFlIHx8ICFlLmF1dGhTZXR0aW5nW1wic2NvcGUudXNlckxvY2F0aW9uXCJdKSByZXR1cm4gdChudWxsKTtcbiAgICAgICAgdGhpcy5fZ2V0TG9jYXRpb24oKS50aGVuKGUgPT4gKHRoaXMuX2xvY2F0aW9uID0gZSwgdChlKSkpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cbiAgZ2V0UGFnZVRpdGxlKHQpIHtcbiAgICB2YXIgZSA9IFwiXCI7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0LmRhdGEudGl0bGUgJiYgdC5kYXRhLnRpdGxlLmxlbmd0aCA+IDAgJiYgKGUgPSB0LmRhdGEudGl0bGUpLCAwID09PSBlLmxlbmd0aCAmJiBfX3d4Q29uZmlnKSB7XG4gICAgICAgIGlmIChfX3d4Q29uZmlnLnRhYkJhcikge1xuICAgICAgICAgIHZhciBpID0gX193eENvbmZpZy50YWJCYXIubGlzdC5maW5kKGUgPT4gZS5wYXRoUGF0aCA9PSB0LnJvdXRlIHx8IGUucGFnZVBhdGggPT0gYCR7dC5yb3V0ZX0uaHRtbGApO1xuICAgICAgICAgIGkgJiYgaS50ZXh0ICYmIChlID0gaS50ZXh0KVxuICAgICAgICB9XG4gICAgICAgIGlmICgwID09IGUubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHMgPSBfX3d4Q29uZmlnLnBhZ2VbdC5yb3V0ZV0gfHwgX193eENvbmZpZy5wYWdlW2Ake3Qucm91dGV9Lmh0bWxgXTtcbiAgICAgICAgICBlID0gcyA/IHMud2luZG93Lm5hdmlnYXRpb25CYXJUaXRsZVRleHQgOiBfX3d4Q29uZmlnLmdsb2JhbC53aW5kb3cubmF2aWdhdGlvbkJhclRpdGxlVGV4dFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBjYXRjaCAodCkge31cbiAgICByZXR1cm4gZVxuICB9XG4gIF9nZXRTZXR0aW5nKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgodCwgZSkgPT4ge1xuICAgICAgd3guZ2V0U2V0dGluZyh7XG4gICAgICAgIHN1Y2Nlc3M6IHQsXG4gICAgICAgIGZhaWw6IGVcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBfZ2V0TG9jYXRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCh0LCBlKSA9PiB7XG4gICAgICB3eC5nZXRMb2NhdGlvbih7XG4gICAgICAgIHN1Y2Nlc3M6IHQsXG4gICAgICAgIGZhaWw6IGVcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxudmFyIFZkc0luc3RydW1lbnRBZ2VudCA9IHtcbiAgZGVmYXVsdFBhZ2VDYWxsYmFja3M6IHt9LFxuICBkZWZhdWx0QXBwQ2FsbGJhY2tzOiB7fSxcbiAgYXBwSGFuZGxlcnM6IFtcIm9uU2hvd1wiLCBcIm9uSGlkZVwiLCBcIm9uRXJyb3JcIl0sXG4gIHBhZ2VIYW5kbGVyczogW1wib25Mb2FkXCIsIFwib25TaG93XCIsIFwib25TaGFyZUFwcE1lc3NhZ2VcIiwgXCJvblRhYkl0ZW1UYXBcIl0sXG4gIGFjdGlvbkV2ZW50VHlwZXM6IFtcInRhcFwiLCBcImxvbmdwcmVzc1wiLCBcImNoYW5nZVwiLCBcImNvbmZpcm1cIl0sXG4gIG9yaWdpbmFsUGFnZTogUGFnZSxcbiAgb3JpZ2luYWxBcHA6IEFwcCxcbiAgaG9vazogZnVuY3Rpb24gKHQsIGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGksIHMgPSBhcmd1bWVudHMgPyBhcmd1bWVudHNbMF0gOiB2b2lkIDA7XG4gICAgICBpZiAocyAmJiBzLmN1cnJlbnRUYXJnZXQgJiYgLTEgIT0gVmRzSW5zdHJ1bWVudEFnZW50LmFjdGlvbkV2ZW50VHlwZXMuaW5kZXhPZihzLnR5cGUpKSB0cnkge1xuICAgICAgICBWZHNJbnN0cnVtZW50QWdlbnQub2JzZXJ2ZXIuYWN0aW9uTGlzdGVuZXIocywgdClcbiAgICAgIH0gY2F0Y2ggKHQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih0KVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2dyb3dpbmdfcGFnZV8gJiYgLTEgIT09IFtcIm9uU2hvd1wiLCBcIm9uTG9hZFwiLCBcIm9uVGFiSXRlbVRhcFwiXS5pbmRleE9mKHQpIHx8IChpID0gZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSwgdGhpcy5fZ3Jvd2luZ19hcHBfICYmIC0xICE9IFZkc0luc3RydW1lbnRBZ2VudC5hcHBIYW5kbGVycy5pbmRleE9mKHQpKSB0cnkge1xuICAgICAgICBWZHNJbnN0cnVtZW50QWdlbnQuZGVmYXVsdEFwcENhbGxiYWNrc1t0XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICB9IGNhdGNoICh0KSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IodClcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9ncm93aW5nX3BhZ2VfICYmIC0xICE9IFZkc0luc3RydW1lbnRBZ2VudC5wYWdlSGFuZGxlcnMuaW5kZXhPZih0KSkge1xuICAgICAgICB2YXIgbiA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIGkgJiYgbi5wdXNoKGkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIFZkc0luc3RydW1lbnRBZ2VudC5kZWZhdWx0UGFnZUNhbGxiYWNrc1t0XS5hcHBseSh0aGlzLCBuKVxuICAgICAgICB9IGNhdGNoICh0KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcih0KVxuICAgICAgICB9IC0gMSAhPSBbXCJvblNob3dcIiwgXCJvbkxvYWRcIiwgXCJvblRhYkl0ZW1UYXBcIl0uaW5kZXhPZih0KSAmJiAoaSA9IGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBpXG4gICAgfVxuICB9LFxuICBpbnN0cnVtZW50OiBmdW5jdGlvbiAodCkge1xuICAgIGZvciAodmFyIGUgaW4gdCkgXG4gICAgICBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHRbZV0gJiYgKHRbZV0gPSB0aGlzLmhvb2soZSwgdFtlXSkpO1xuICAgIHJldHVybiB0Ll9ncm93aW5nX2FwcF8gJiYgVmRzSW5zdHJ1bWVudEFnZW50LmFwcEhhbmRsZXJzLm1hcChmdW5jdGlvbiAoZSkge1xuICAgICAgdFtlXSB8fCAodFtlXSA9IFZkc0luc3RydW1lbnRBZ2VudC5kZWZhdWx0QXBwQ2FsbGJhY2tzW2VdKVxuICAgIH0pLCB0Ll9ncm93aW5nX3BhZ2VfICYmIFZkc0luc3RydW1lbnRBZ2VudC5wYWdlSGFuZGxlcnMubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICB0W2VdIHx8ICh0W2VdID0gVmRzSW5zdHJ1bWVudEFnZW50LmRlZmF1bHRQYWdlQ2FsbGJhY2tzW2VdKVxuICAgIH0pLCB0XG4gIH0sXG4gIEdyb3dpbmdQYWdlOiBmdW5jdGlvbiAodCkge1xuICAgIHQuX2dyb3dpbmdfcGFnZV8gPSAhMCwgVmRzSW5zdHJ1bWVudEFnZW50Lm9yaWdpbmFsUGFnZShWZHNJbnN0cnVtZW50QWdlbnQuaW5zdHJ1bWVudCh0KSlcbiAgfSxcbiAgR3Jvd2luZ0FwcDogZnVuY3Rpb24gKHQpIHtcbiAgICB0Ll9ncm93aW5nX2FwcF8gPSAhMCwgVmRzSW5zdHJ1bWVudEFnZW50Lm9yaWdpbmFsQXBwKFZkc0luc3RydW1lbnRBZ2VudC5pbnN0cnVtZW50KHQpKVxuICB9LFxuICBpbml0SW5zdHJ1bWVudDogZnVuY3Rpb24gKHQpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdpbml0SW5zdHJ1bWVudCcsIHQpXG4gICAgVmRzSW5zdHJ1bWVudEFnZW50Lm9ic2VydmVyID0gdCwgVmRzSW5zdHJ1bWVudEFnZW50LnBhZ2VIYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uICh0KSB7XG4gICAgICBWZHNJbnN0cnVtZW50QWdlbnQuZGVmYXVsdFBhZ2VDYWxsYmFja3NbdF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX19yb3V0ZV9fICYmIFZkc0luc3RydW1lbnRBZ2VudC5vYnNlcnZlci5wYWdlTGlzdGVuZXIodGhpcywgdCwgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH0pLCBWZHNJbnN0cnVtZW50QWdlbnQuYXBwSGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAodCkge1xuICAgICAgVmRzSW5zdHJ1bWVudEFnZW50LmRlZmF1bHRBcHBDYWxsYmFja3NbdF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFZkc0luc3RydW1lbnRBZ2VudC5vYnNlcnZlci5hcHBMaXN0ZW5lcih0aGlzLCB0LCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfSksIFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gVmRzSW5zdHJ1bWVudEFnZW50Lkdyb3dpbmdQYWdlKGFyZ3VtZW50c1swXSlcbiAgICB9LCBBcHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gVmRzSW5zdHJ1bWVudEFnZW50Lkdyb3dpbmdBcHAoYXJndW1lbnRzWzBdKVxuICAgIH1cbiAgfVxufTtcbmNsYXNzIEdyb3dpbmdJTyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudXBsb2FkaW5nTWVzc2FnZXMgPSBbXVxuICB9XG4gIGluaXQodCwgZSwgaSA9IHt9KSB7XG4gICAgdGhpcy5wcm9qZWN0SWQgPSB0LCBcbiAgICB0aGlzLmFwcElkID0gZSwgXG4gICAgdGhpcy5hcHBWZXIgPSBpLnZlcnNpb24sIFxuICAgIHRoaXMuZGVidWcgPSBpLmRlYnVnIHx8ICExLCBcbiAgICB0aGlzLmZvcmNlTG9naW4gPSBpLmZvcmNlTG9naW4gfHwgITEsIFxuICAgIHRoaXMud2VpeGluID0gbmV3IFdlaXhpbih0aGlzKSwgXG4gICAgdGhpcy5lc2lkID0gdGhpcy53ZWl4aW4uZXNpZCwgXG4gICAgdGhpcy51cGxvYWRlciA9IG5ldyBVcGxvYWRlcih0aGlzLnByb2plY3RJZCwgdGhpcy5hcHBJZCksIFxuICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgT2JzZXJ2ZXIodGhpcyksIFxuICAgIHRoaXMuX3N0YXJ0KClcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMub2JzZXJ2ZXIpXG4gIH1cbiAgc2V0SG9zdCh0KSB7XG4gICAgdGhpcy51cGxvYWRlci5zZXRIb3N0KHQpXG4gIH1cbiAgbG9naW4odCkge1xuICAgIGlmICh0aGlzLmZvcmNlTG9naW4pXG4gICAgICBmb3IgKHZhciBlIG9mICh0aGlzLndlaXhpbi51aWQgPSB0LCB0aGlzLmZvcmNlTG9naW4gPSAhMSwgdGhpcy51cGxvYWRpbmdNZXNzYWdlcykpIGUudSA9IHQsIHRoaXMuX3VwbG9hZChlKVxuICB9XG4gIHVwbG9hZCh0KSB7XG4gICAgdGhpcy5mb3JjZUxvZ2luID8gdGhpcy51cGxvYWRpbmdNZXNzYWdlcy5wdXNoKHQpIDogdGhpcy5fdXBsb2FkKHQpXG4gIH1cbiAgZm9yY2VGbHVzaCgpIHtcbiAgICB0aGlzLndlaXhpbi5lc2lkID0gdGhpcy5lc2lkLCB0aGlzLnVwbG9hZGVyLmZvcmNlRmx1c2goKVxuICB9XG4gIHByb3h5KHQsIGUpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5vYnNlcnZlciAmJiB0aGlzLm9ic2VydmVyW3RdICYmIHRoaXMub2JzZXJ2ZXJbdF0uYXBwbHkodGhpcy5vYnNlcnZlciwgZSlcbiAgICB9IGNhdGNoICh0KSB7XG4gICAgICBjb25zb2xlLmVycm9yKHQpXG4gICAgfVxuICB9XG4gIF9zdGFydCgpIHtcbiAgICBWZHNJbnN0cnVtZW50QWdlbnQuaW5pdEluc3RydW1lbnQodGhpcy5vYnNlcnZlcilcbiAgfVxuICBfdXBsb2FkKHQpIHtcbiAgICB0LmVzaWQgPSB0aGlzLmVzaWQrKywgdGhpcy5kZWJ1ZyAmJiBjb25zb2xlLmluZm8oXCJnZW5lcmF0ZSBuZXcgZXZlbnRcIiwgSlNPTi5zdHJpbmdpZnkodCwgMCwgMikpLCB0aGlzLnVwbG9hZGVyLnVwbG9hZCh0KVxuICB9XG59XG52YXIgZ3Jvd2luZ2lvID0gbmV3IEdyb3dpbmdJTyxcbiAgZ2lvID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ID0gYXJndW1lbnRzWzBdO1xuICAgIGlmICh0KSB7XG4gICAgICB2YXIgZSA9IDIgPiBhcmd1bWVudHMubGVuZ3RoID8gW10gOiBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAvLyBjb25zb2xlLmxvZyh0LCBlKVxuICAgICAgaWYgKFwiaW5pdFwiID09PSB0KSB7XG4gICAgICAgIGlmICgyID4gZS5sZW5ndGgpIHJldHVybiB2b2lkIGNvbnNvbGUubG9nKFwi5Yid5aeL5YyWIEdyb3dpbmdJTyBTREsg5aSx6LSl44CC6K+35L2/55SoIGdpbygnaW5pdCcsICfkvaDnmoRHcm93aW5nSU/pobnnm65JRCcsICfkvaDnmoTlvq7kv6FBUFBfSUQnLCBvcHRpb25zKTtcIik7XG4gICAgICAgIGdyb3dpbmdpby5pbml0KGVbMF0sIGVbMV0sIGVbMl0pXG4gICAgICB9IGVsc2UgZ3Jvd2luZ2lvLnByb3h5KHQsIGUpXG4gICAgfVxuICB9O1xuY29uc29sZS5sb2coXCJpbml0IGdyb3dpbmdpby4uLlwiKSwgbW9kdWxlLmV4cG9ydHMgPSBnaW87XG4iXX0=