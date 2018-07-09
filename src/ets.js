import * as util from './util'
import ETS_CONFIG from './config'
import Observer from './observer'

export default class ETS {
  static $config = ETS_CONFIG
  prefix = '_ets_'
  constructor () {
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
