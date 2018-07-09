const Proxy = require('./proxy')
class Observer {
  constructor (ets) {
    this.ets = ets
    this.proxy = new Proxy(this)
    this.proxy.init()
    //TODO
  }
  addEventListener (name, args) {
    if (args.type === 'tap') {
      this.trackTap(name)
    }
  }
  addPageListener () {

  }
  trackTap (name, args) {
    console.log('track tap from ets', name, args)
  }
}
module.exports = Observer