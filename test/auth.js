const test = require('tape')
const level = require('level-test')()
const auth = require('../lib/auth')

test('sets credentials and calls back', function (t) {
  t.plan(3)
  const client = {
    setSessionCredentials (username, key) {
      t.equal(username, 'foo')
      t.equal(key, 'bar')
    }
  }
  const d = level('foo1', { valueEncoding: 'json' })
  d.put('session', { username: 'foo', key: 'bar' }, function (err) {
    if (err) throw err
    auth.login(client, d, function (_, session) {
      t.deepEqual(session, { username: 'foo', key: 'bar' })
    })
  })
})

test('logout', function (t) {
  t.plan(3)
  const client = {
    setSessionCredentials (username, key) {
      t.equal(username, null)
      t.equal(key, null)
    }
  }
  const d = level('foo2', { valueEncoding: 'json' })
  d.put('session', { foo: 'bar' }, function (err) {
    if (err) throw err
    auth.logout(client, d, function () {
      t.pass('logged out')
    })
  })
})

test('isLoggedIn', function (t) {
  t.plan(1)
  t.ok(auth.isLoggedIn({ sessionCredentials: { key: 'foo' } }))
})
