const Proxy = require('./proxy')
const util = require('./util')
class Observer {
  get sid () {
    return util.getSID() || util.setSID()
  }
  get uid () {
    return util.getUID() || util.setUID()
  }
  constructor (ets) {
    this.sence = null
    this.ref = null
    this.ets = ets
    this.proxy = new Proxy(this)
    this.proxy.init()
    //TODO
  }
  trackPageHandlers (target, name, args) {
    if (this.ets.config.debug) {
      console.log('Page.' + name, target.__route__)
    }
    if (name === 'onLoad') {
      // TODO
    } else if (name === 'onShareAppMessage') {
      // TODO
    } else if (name === 'onTabItemTap') {
      // TODO
    } else if (name === 'onPullDownRefresh') {
      // TODO
    }
  }
  trackAppHandlers (target, name, args) {
    if (this.ets.config.debug) {
      console.log('APP.' + name)
    }
  }
  trackEvents (name, event) {
    if (this.ets.config.debug) {
      console.log(`bind${event.type}:${name}`)
    }
  }
}
module.exports = Observer