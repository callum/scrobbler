module.exports.login = login
module.exports.logout = logout
module.exports.isLoggedIn = isLoggedIn

function login (client, db, cb) {
  db.get('session', function (err, session) {
    if (!err) {
      client.setSessionCredentials(session.username, session.key)
      return cb(null, session)
    }
    requestToken(client, function (err, token) {
      if (err) return cb(err)
      client.authenticate(token, function (err, session) {
        if (err) return cb(err)
        db.put('session', session)
        cb(null, session)
      })
    })
  })
}

function logout (client, db, cb) {
  db.del('session', function (err) {
    if (err) return cb(err)
    client.setSessionCredentials(null, null)
    cb(null)
  })
}

function isLoggedIn (client) {
  const creds = client.sessionCredentials
  return creds && creds.key
}

function requestToken (client, cb) {
  const BrowserWindow = require('electron').BrowserWindow

  var win = new BrowserWindow({ width: 1024, height: 600 })
  win.once('closed', closed)
  win.webContents.on('will-navigate', function (event, location) {
    const matched = location.match(/^http:\/\/example\.com\/\?token=(\w+)$/)
    if (matched) {
      win.removeListener('closed', closed)
      win.close()
      win = null
      cb(null, matched[1])
    }
  })
  win.loadURL(client.getAuthenticationUrl({ cb: 'http://example.com/' }))

  function closed () {
    cb(new Error('Login failed'))
  }
}
