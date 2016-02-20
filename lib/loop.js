const EventEmitter = require('events')
const inherits = require('util').inherits

module.exports = Loop

function Loop () {
  if (!(this instanceof Loop)) return new Loop()
  EventEmitter.call(this)
  this.started = false
  this.elapsed = 0
}
inherits(Loop, EventEmitter)

Loop.prototype.update = function update (track) {
  this.reset()

  if (this.prevTrack) {
    this.emit('complete', this.prevTrack, this.updatedAt)
    this.prevTrack = undefined
  }

  if (track.duration > 30) {
    this.track = track
    this.updatedAt = Date.now()
    this.start()
  }
}

Loop.prototype.tick = function tick () {
  this.elapsed++
  if (this.elapsed >= (this.track.duration / 2) || this.elapsed >= 60 * 4) {
    this.prevTrack = this.track
    this.reset()
  }
}

Loop.prototype.start = function start () {
  if (this.track && !this.started) {
    this.emit('start')
    this.started = true
    this.startTick()
  }
}

Loop.prototype.stop = function stop () {
  if (this.started) {
    this.stopTick()
    this.started = false
    this.emit('stop')
  }
}

Loop.prototype.reset = function reset () {
  if (this.started) {
    this.stop()
    this.elapsed = 0
    this.track = undefined
  }
}

Loop.prototype.startTick = function startTick () {
  this.loop = setInterval(this.tick.bind(this), 1000)
}

Loop.prototype.stopTick = function stopTick () {
  clearInterval(this.loop)
}
