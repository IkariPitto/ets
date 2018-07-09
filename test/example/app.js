var ETS = require('./ets')
let ets = new ETS({
  appid: 'wx334e318daed16cac',
  eventid: 'a-0001',
  debug: true
})
App({
  onLaunch: function(options) {
    console.log(ets)
    console.log('app launch options:', options)
  },
  onShow: function(options) {
    console.log('app onShow options:', options)
  }
})