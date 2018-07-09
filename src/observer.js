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
    this.ets = ets
    this.proxy = new Proxy(this)
    this.proxy.init()
    //TODO
  }
  trackPageHandlers (target, name, args) {
    if (this.ets.config.debug) {
      console.log(`%c ETS Log:%c Page.${name} %c${target.__route__}`, 'background:#f65000;color:#fff;', 'font-weight: 700;', 'color:red;')
    }

  }
  trackAppHandlers (target, name, args) {
    if (this.ets.config.debug) {
      console.log(`%c ETS Log:%c App.${name}`, 'background:#f65000;color:#fff;', 'font-weight: 700;')
    }
  }
  trackEvents (name, event) {
    if (this.ets.config.debug) {
      console.log(`%c ETS Log:%c bind${event.type}:${name}`, 'background:#f65000;color:#fff;', 'font-weight: 700;')
    }
  }
}
module.exports = Observer