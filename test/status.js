const test = require('tape')
const Status = require('../lib/status')

test('emit halt', function (t) {
  t.plan(1)
  const status = Status()
  status.on('halt', function () { t.pass() })
  status.check({})
})

test('emit changed state', function (t) {
  t.plan(3)
  const status = Status()
  status.on('play', function () { t.pass('play') })
  status.on('pause', function () { t.pass('pause') })
  status.on('stop', function () { t.pass('stop') })
  status.check({ state: 'playing' })
  status.check({ state: 'playing' })
  status.check({ state: 'paused' })
  status.check({ state: 'paused' })
  status.check({ state: 'stopped' })
  status.check({ state: 'stopped' })
})

test('emit changed track', function (t) {
  t.plan(1)
  const status = Status()
  status.on('track', function (track) { t.deepEqual(track, { foo: 'bar' }) })
  status.check({ state: 'playing', track: { foo: 'bar' } })
  status.check({ state: 'playing', track: { foo: 'bar' } })
})
