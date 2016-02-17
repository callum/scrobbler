'use strict'

const fs = require('fs')
const electron = require('electron')
const playback = require('playback')
const LastFm = require('lastfmapi')
const app = electron.app
const shell = electron.shell
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const Tray = electron.Tray

const client = new LastFm(require('./config.json'))

let tray

app.on('ready', function () {
  app.dock.hide()

  tray = new Tray('icon.png')

  setContextMenu([quit()])

  auth(function (username) {
    setContextMenu([
      profile(username),
      { type: 'separator' },
      quit()
    ])

    playback.on('playing', function (track) {
      setContextMenu([
        { label: `${track.name} - ${track.artist}`, enabled: false },
        { type: 'separator' },
        profile(username),
        { type: 'separator' },
        quit()
      ])

      const params = {
        track: track.name,
        artist: track.artist,
        timestamp: Math.floor(Date.now() / 1000)
      }

      client.track.updateNowPlaying(params, function (err, res) {
        if (err) throw err
      })

      client.track.scrobble(params, function (err, res) {
        if (err) throw err
      })
    })
  })
})

app.on('window-all-closed', function (event) {
  event.preventDefault()
})

function auth (callback) {
  const path = __dirname + '/.scrobbler'
  let session

  try {
    session = JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch (err) {
    console.log('Session not found')
  }

  if (session) {
    client.setSessionCredentials(session.username, session.key)
    return callback(session.username)
  }

  getToken(function (token) {
    client.authenticate(token, function (err, session) {
      if (err) throw err

      fs.writeFileSync(path, JSON.stringify({
        username: session.username,
        key: session.key
      }))

      callback(session.username)
    })
  })
}

function getToken (callback) {
  let dialog = new BrowserWindow({ width: 1024, height: 600 })
  dialog.loadURL(client.getAuthenticationUrl({ cb: 'http://example.com/' }))

  dialog.webContents.on('will-navigate', function (event, location) {
    const match = location.match(/^http:\/\/example\.com\/\?token=(\w+)$/)

    if (match) {
      dialog.close()
      dialog = null
      callback(match[1])
    }
  })
}

function setContextMenu (template) {
  const contextMenu = Menu.buildFromTemplate(template)
  tray.setContextMenu(contextMenu)
}

function profile (username) {
  return {
    label: 'Last.fm profile',
    click () {
      shell.openExternal(`http://last.fm/user/${username}`)
    }
  }
}

function quit () {
  return { label: 'Quit', click: app.quit }
}
