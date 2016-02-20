const path = require('path')
const script = require('applescript')
const EventEmitter = require('events')
const inherits = require('util').inherits
const equal = require('deep-equal')

const scriptPath = path.join(__dirname, 'status.applescript')

module.exports = Status

function Status () {
  if (!(this instanceof Status)) return new Status()
  EventEmitter.call(this)
}
inherits(Status, EventEmitter)

Status.prototype.exec = function exec () {
  script.execFile(scriptPath, (err, res) => {
    if (!err) this.check(parse(res))
  })
}

Status.prototype.check = function check (data) {
  const state = data.state
  const track = data.track

  if (!state && this.lastState !== 'halted') {
    this.emit('halt')
    this.lastState = 'halted'
  }
  if (state && this.lastState !== state) {
    if (state === 'playing') this.emit('play')
    if (state === 'paused') this.emit('pause')
    if (state === 'stopped') this.emit('stop')
    this.lastState = state
  }
  if (track && !equal(this.lastTrack, track)) {
    this.emit('track', track)
    this.lastTrack = track
  }
}

Status.prototype.start = function start () {
  if (!this.loop) this.loop = setInterval(this.exec.bind(this), 2000)
}

Status.prototype.stop = function stop () {
  if (this.loop) clearInterval(this.loop)
}

function parse (json) {
  var data = {}
  try {
    data = JSON.parse(json)
  } catch (err) {
    return data
  }
  return data
}
