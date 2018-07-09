var ETS_CONFIG = require('./config')
const util = require('./util')
const Observer = require('./observer')

class ETS {
  $config = ETS_CONFIG
  prefix = '_ets_'
  constructor (options) {
    Object.assign(this.$config, options)
    this.observer = new Observer(this)
  }
  get sid () {
    return util.getSID() || util.setSID()
  }
  get uid () {
    return util.getUID() || util.setUID()
  }
  init () {

  }
}
module.exports = ETS
