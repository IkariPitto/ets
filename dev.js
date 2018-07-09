var Bundler = require("parcel-bundler")
const Path = require('path')
const file = Path.join(__dirname, './src/ets.js')

try {
  const bundler = new Bundler(file, {
    outDir: './test/example',
    outFile: 'ets.js',
  })
  
  bundler.on('bundled', function(bundler) {
    console.log(bundler)
  })
  bundler.on('buildEnd', () => {
    console.log('end')
  })
} catch (err) {
  console.log(err)
}
