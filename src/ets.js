var ETS_CONFIG = require('./config')
const Observer = require('./observer')

class ETS {
  config = ETS_CONFIG
  prefix = '_ets_'
  constructor (options) {
    Object.assign(this.config, options)
    this.observer = new Observer(this)
  }
  
  init () {

  }
}
module.exports = ETS
