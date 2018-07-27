var ETS_CONFIG = require('./config')
const Observer = require('./observer')

class ETS {
  config = ETS_CONFIG
  prefix = '_ets_'
  constructor (options) {
    Object.assign(this.config, options)
    this.observer = new Observer(this)
  }
  // 设置用户id
  setUserId() {
    // TODO:设置用户信息
  }
  // 设置openid
  setOpenid (openId) {

  }
  // 设置页面级变量
  setPage (params) {

  }
  // 发送自定义事件
  track (eventId, eventName, params) {

  }
  // 发送页面访问
  setVisit (pageName, path, params) {

  }
}
module.exports = ETS
