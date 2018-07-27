class Proxy {
  originApp = App
  originPage = Page
  defaultPageHandlers = {}
  defaultAppHandlers = {}
  lifeCircles = {
    App: ['onLaunch', 'onShow', 'onError'],
    Page: ['onLoad', 'onShow', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onTabItemTap'],
  }
  eventType = ['tap']
  constructor (observer) {
    this.observer = observer
    this.init()
  }
  hook (name, handler) {
    var $this = this
    return function () {
      var args = arguments ? arguments[0] : null
      if (args && args.currentTarget && $this.eventType.indexOf(args.type) >= 0) {
        try {
          $this.observer.trackEvents(name, args)
        } catch (ex) {
          console.error(ex)
        }
      }
      if (this._ets_app && $this.lifeCircles.App.indexOf(name) >= 0) {
        $this.defaultAppHandlers[name].apply(this, arguments)
      }
      if (this._ets_page && $this.lifeCircles.Page.indexOf(name) >= 0) {
        $this.defaultPageHandlers[name].apply(this, arguments)
      }
      handler.apply(this, arguments)
      return args
    }
  }
  intercept (args) {
    Object.keys(args).forEach(key => {
      if (typeof args[key] === 'function') {
        args[key] = this.hook(key, args[key])
      }
    })
    return args
  }
  ETSPage (pageArgs) {
    pageArgs._ets_page = true
    pageArgs.onLoad || (pageArgs.onLoad = function () {})
    this.originPage(this.intercept(pageArgs))
  }
  ETSApp (appArgs) {
    appArgs._ets_app = true
    this.originApp(this.intercept(appArgs))
  }
  init () {
    let $this = this
    this.lifeCircles.App.forEach(name => {
      this.defaultAppHandlers[name] = function () {
        $this.observer.trackAppHandlers(this, name, arguments)
      }
    })
    this.lifeCircles.Page.forEach(name => {
      this.defaultPageHandlers[name] = function () {
        console.log(this, 'from proxy')
        this.__route__ && $this.observer.trackPageHandlers(this, name, arguments)
      }
    })
    Page = function (...args) {
      return $this.ETSPage(args[0])
    }
    App = function (...args) {
      return $this.ETSApp(args[0])
    }
  }
}
module.exports = Proxy