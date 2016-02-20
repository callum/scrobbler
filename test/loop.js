const test = require('tape')
const Loop = require('../lib/loop')

test('update resets loop', function (t) {
  t.plan(1)
  const loop = Loop()
  loop.reset = function () { t.pass() }
  loop.update({ duration: 0 })
})

test('only start for tracks > 30s', function (t) {
  t.plan(1)
  const loop = Loop()
  loop.start = function () { t.pass('started once') }
  loop.reset = function () {}
  loop.update({ duration: 0 })
  loop.update({ duration: 60 * 3 })
})

test('emit complete after half of track duration', function (t) {
  t.plan(2)
  const loop = Loop()
  loop.start = function () {}
  loop.reset = function () {}
  loop.on('complete', function (track, updatedAt) {
    t.deepEqual(track, { name: 'foo', duration: 60 })
    t.ok(updatedAt, 'has timestamp')
  })
  loop.update({ name: 'foo', duration: 60 })
  for (var i = 0; i < 60; i++) loop.tick()
  loop.update({ duration: 60 })
})

test('emit complete after 4m', function (t) {
  t.plan(2)
  const loop = Loop()
  loop.start = function () {}
  loop.reset = function () {}
  loop.on('complete', function (track, updatedAt) {
    t.deepEqual(track, { name: 'foo', duration: 60 * 60 })
    t.ok(updatedAt, 'has timestamp')
  })
  loop.update({ name: 'foo', duration: 60 * 60 })
  for (var i = 0; i < 60 * 4; i++) loop.tick()
  loop.update({ duration: 60 })
})

test('start', function (t) {
  t.plan(3)
  const loop = Loop()
  loop.startTick = function () { t.pass('starts tick') }
  loop.on('start', function () { t.pass('emits once') })
  loop.start()
  loop.track = 'foo'
  loop.start()
  t.equal(loop.started, true)
})

test('stop', function (t) {
  t.plan(3)
  const loop = Loop()
  loop.stopTick = function () { t.pass('stops tick') }
  loop.on('stop', function () { t.pass('emits once') })
  loop.stop()
  loop.started = true
  loop.stop()
  t.equal(loop.started, false)
})
