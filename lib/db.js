const path = require('path')
const level = require('level')

var dir = path.join(__dirname, '..')

// dir = path.join(app.getPath('appData'), 'Scrobbler')
// if (!fs.existsSync(dir)) fs.mkdirSync(dir)

module.exports = level(path.join(dir, 'app.db'), { valueEncoding: 'json' })
