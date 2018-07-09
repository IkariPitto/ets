const prefix = '_ets_'
function getNetWorkInfo (fn) {
  wx.getNetworkType({
    success: res => {
      typeof fn === 'function' && fn(res.networkType)
    },
    fail: res => {
      typeof fn === 'function' && fn(res)
    }
  })
}

function getSystemInfo () {
  var sys = wx.getSystemInfoSync()
  return {
    model: sys.model,
    scl: sys.pixelRatio,
    scr: sys.windowWidth + 'x' + sys.windowHeight,
    lang: sys.language,
    version: sys.version,
    system: sys.system,
    platform: sys.platform
  }
}

function setSID () {
  try {
    let sid = 's' + getRandom()
    wx.setStorageSync(prefix + 'sid', sid)
    return sid
  } catch (e) {
    console.error('set session id error:' + e)
  }
}
function getSID () {
  try {
    return wx.getStorageSync(prefix + 'sid')
  } catch (e) {
    console.error('get session id error:' + e)
  }
}


function setUID () {
  try {
    let uid = 'u' + getRandom()
    wx.setStorageSync(prefix + 'uid', uid)
    return uid
  } catch (e) {
    console.error('set user id error:' + e)
  }
}
function getUID () {
  try {
    return wx.getStorageSync(prefix + 'uid')
  } catch (e) {
    console.error('get user id error:' + e)

  }
}

function getRandom (a) {
  for (var b = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], c = 10; c > 1; c--) {
    var d = Math.floor(10 * Math.random())
    var e = b[d]
    b[d] = b[c - 1]
    b[c - 1] = e
  }
  for (c = d = 0; c < 5; c++) d = 10 * d + b[c]
  return (a || '') + (d + '' + +new Date())
}

function getRoutePath () {
  try {
    let pages = getCurrentPages()
    let path = '/'
    pages.length > 0 && (path = pages.pop().__route__)
    return path
  } catch (e) {
    console.log('get current page path error:' + e)
  }
}

function getBasicInfo () {
  let system = getSystemInfo()
  getNetWorkInfo(type => {
    try {
      wx.setStorageSync(this.prefix + 'network', type)
    } catch (e) {
      console.error(e)
    }
  })
  system.network = wx.getStorageSync(this.prefix + 'network')
  return {
    system
  }
}

module.exports = {
  setSID,
  getSID,
  setUID,
  getUID,
  getRoutePath,
  getBasicInfo
}