var ETS = require('./ets')
new ETS({
  appid: 'wxe90895a64b3f2658',
  debug: true
})
var gio = require("./gio-minp.js");
gio('init', '82535a91f863c70f', 'wxe90895a64b3f2658', { version: '1.0' });
App({
  globalData: {
    gio: gio
  },
  onLaunch: function(options) {
    console.log('app launch options:', options)
  },
  onShow: function(options) {
    console.log('app onShow options:', options)
  }
})