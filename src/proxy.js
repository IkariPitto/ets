export default class Proxy {
  originApp = App
  originPage = Page
  
  constructor (observer) {
    this.observer = observer
  }
  hook () {
    // TODO: 
  }
  ETSPage (pageArgs) {
    this.originPage(pageArgs)
  }
  init () {
    Page = function (...args) {
      return this.ETSPage(args[0])
    }
  }
}