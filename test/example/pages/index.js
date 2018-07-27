Page({
  onLoad: function(options) {
    
    console.log('index page onLoad options:', options, this)
  },
  onShow: function() {
    getApp().globalData.gio('setPage', {
      pageName: "首页",
      pageRoute: this.route
    })
    // Do something when page show.
  },
  onTapHandler (e) {
    console.log('on tap from page', e)
    getApp().globalData.gio('track', 'onClick', {
      id: 1
    })
  }
})