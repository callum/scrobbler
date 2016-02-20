const electron = require('electron')
const LastFm = require('lastfmapi')
const jobs = require('level-jobs')
const auth = require('./lib/auth')
const db = require('./lib/db')
const Loop = require('./lib/loop')
const Status = require('./lib/status')
const Menu = electron.Menu
const Tray = electron.Tray
const app = electron.app
const powerSaveBlocker = electron.powerSaveBlocker
const shell = electron.shell

const client = new LastFm(require('./config.json'))
const queue = jobs(db, worker, {
  backoff: { initialDelay: 5000, maxDelay: 10000 }
})
function worker (track, cb) {
  if (auth.isLoggedIn(client)) client.track.scrobble(track, cb)
}

var suspendId

const loop = Loop()
loop.on('start', preventSuspension)
loop.on('stop', resetSuspension)
loop.on('complete', function (track, updatedAt) {
  queue.push({
    track: track.name,
    artist: track.artist,
    timestamp: Math.floor(updatedAt / 1000)
  })
})

const status = Status()
status.on('play', loop.start.bind(loop))
status.on('pause', loop.stop.bind(loop))
status.on('stop', loop.reset.bind(loop))
status.on('halt', loop.reset.bind(loop))
status.on('track', function (track) {
  if (auth.isLoggedIn(client)) {
    client.track.updateNowPlaying({ track: track.name, artist: track.artist })
  }
  loop.update(track)
})
status.start()

var tray
app.on('ready', function () {
  app.dock.hide()
  tray = new Tray('icon.png')
  setLoggedOutMenu()
  initialize()
})

app.on('window-all-closed', function (event) {
  event.preventDefault()
})

function openProfile (username) {
  shell.openExternal(`http://last.fm/user/${username}`)
}

function initialize () {
  auth.login(client, db, function (_, session) {
    status.start()
    setLoggedInMenu(session)
  })
}

function terminate () {
  auth.logout(client, db, function () {
    status.stop()
    loop.stop()
    setLoggedOutMenu()
  })
}

function preventSuspension () {
  if (typeof suspendId === 'undefined') {
    suspendId = powerSaveBlocker.start('prevent-app-suspension')
  }
}

function resetSuspension () {
  if (typeof suspendId !== 'undefined') {
    powerSaveBlocker.stop(suspendId)
    suspendId = undefined
  }
}

function setLoggedInMenu (session) {
  setMenu([
    { label: 'Last.fm profile',
      click: openProfile.bind(null, session.username) },
    { type: 'separator' },
    { label: 'Logout', click: terminate },
    { type: 'separator' },
    { label: 'Quit', click: app.quit }
  ])
}

function setLoggedOutMenu () {
  setMenu([
    { label: 'Login', click: initialize },
    { label: 'Quit', click: app.quit }
  ])
}

function setMenu (template) {
  tray.setContextMenu(Menu.buildFromTemplate(template))
}
