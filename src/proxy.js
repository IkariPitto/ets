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
          $this.observer.addEventListener(name, args)
        } catch (ex) {
          console.error(ex)
        }
      }
      handler(args)
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
    console.log(pageArgs, 'page')
    this.originPage(this.intercept(pageArgs))
  }
  ETSApp (appArgs) {
    console.log(appArgs, 'app')
    this.originApp(appArgs)
  }
  init () {
    let $this = this
    Page = function (...args) {
      return $this.ETSPage(args[0])
    }
    App = function (...args) {
      return $this.ETSApp(args[0])
    }
  }
}
module.exports = Proxy