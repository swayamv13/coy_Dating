const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { after, test } = require('node:test')

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'coy-discover-test-'))
process.env.DB_PATH = path.join(temporaryDirectory, 'integration.db')
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex')
process.env.NODE_ENV = 'test'
process.env.PORT = '0'

const { server } = require('../dist/index.js')
const { db } = require('../dist/database/connection.js')
const address = server.address()
const baseUrl = `http://127.0.0.1:${address.port}`
const listening = server.listening
  ? Promise.resolve()
  : new Promise((resolve) => server.once('listening', resolve))
let localCode = ''

const originalInfo = console.info
console.info = (...values) => {
  const match = String(values[0]).match(/: (\d{5})/)
  if (match) localCode = match[1]
  originalInfo(...values)
}

function cookieFrom(response) {
  const header = response.headers.getSetCookie().find((value) => value.startsWith('coy_session='))
  assert.ok(header, 'authentication response should set an HttpOnly session cookie')
  return header.split(';', 1)[0]
}

async function request(pathname, { method = 'GET', body, cookie, headers = {} } = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(cookie ? { cookie } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json()
  return { response, data }
}

async function register(phoneNumber, profile) {
  localCode = ''
  const requested = await request('/api/auth/request-code', {
    method: 'POST',
    body: { phoneNumber },
  })
  assert.equal(requested.response.status, 202)
  assert.equal(localCode, '12345')

  const verified = await request('/api/auth/verify-code', {
    method: 'POST',
    body: { phoneNumber, code: localCode },
  })
  assert.equal(verified.response.status, 200)
  assert.equal(verified.data.profileRequired, true)
  const onboardingCookie = cookieFrom(verified.response)

  const completed = await request('/api/auth/complete-profile', {
    method: 'POST',
    body: profile,
    cookie: onboardingCookie,
  })
  assert.equal(completed.response.status, 201)
  return { cookie: cookieFrom(completed.response), user: completed.data.user }
}

after(async () => {
  console.info = originalInfo
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
  db.close()
  fs.rmSync(temporaryDirectory, { recursive: true, force: true })
})

test('phone OTP, reciprocal discovery, private matching, chat, and trends work end to end', async () => {
  await listening
  const unauthorized = await request('/api/discover', {
    headers: { 'x-user-id': '1' },
  })
  assert.equal(unauthorized.response.status, 401)

  const woman = await register('+15550001001', {
    name: 'Avery', age: 27, gender: 'Woman', lookingFor: ['Men'],
    location: 'Toronto', bio: '', interests: ['Music', 'Hiking'],
  })
  const man = await register('+15550001002', {
    name: 'Jordan', age: 29, gender: 'Man', lookingFor: ['Women'],
    location: 'Toronto', bio: 'Loves live music.', interests: ['Music', 'Travel'],
  })
  const nonBinary = await register('+15550001003', {
    name: 'Riley', age: 26, gender: 'Non-binary', lookingFor: ['Women'],
    location: 'Toronto', bio: '', interests: ['Art', 'Music'],
  })

  const womanDiscover = await request('/api/discover?limit=50', { cookie: woman.cookie })
  const manDiscover = await request('/api/discover?limit=50', { cookie: man.cookie })
  const nonBinaryDiscover = await request('/api/discover?limit=50', { cookie: nonBinary.cookie })
  assert.equal(womanDiscover.response.status, 200)
  assert.ok(womanDiscover.data.profiles.some((profile) => profile.id === man.user.id))
  assert.ok(!womanDiscover.data.profiles.some((profile) => profile.id === nonBinary.user.id))
  assert.ok(manDiscover.data.profiles.some((profile) => profile.id === woman.user.id))
  assert.ok(!nonBinaryDiscover.data.profiles.some((profile) => profile.id === woman.user.id))

  const incompatibleLike = await request('/api/swipes', {
    method: 'POST',
    cookie: woman.cookie,
    body: { targetUserId: nonBinary.user.id, action: 'like' },
  })
  assert.equal(incompatibleLike.response.status, 403)

  const firstLike = await request('/api/swipes', {
    method: 'POST',
    cookie: woman.cookie,
    body: { targetUserId: man.user.id, action: 'like' },
  })
  assert.equal(firstLike.response.status, 200)
  assert.equal(firstLike.data.mutualMatchCreated, false)

  const mutualLike = await request('/api/swipes', {
    method: 'POST',
    cookie: man.cookie,
    body: { targetUserId: woman.user.id, action: 'like' },
  })
  assert.equal(mutualLike.response.status, 201)
  assert.equal(mutualLike.data.mutualMatchCreated, true)
  const matchId = mutualLike.data.matchId

  const forbiddenChat = await request(`/api/matches/${matchId}/messages`, {
    cookie: nonBinary.cookie,
  })
  assert.equal(forbiddenChat.response.status, 404)

  const sentMessage = await request(`/api/matches/${matchId}/messages`, {
    method: 'POST',
    cookie: woman.cookie,
    body: { body: 'Hello, Jordan!' },
  })
  assert.equal(sentMessage.response.status, 201)
  const receivedMessages = await request(`/api/matches/${matchId}/messages`, {
    cookie: man.cookie,
  })
  assert.equal(receivedMessages.response.status, 200)
  assert.equal(receivedMessages.data.messages[0].body, 'Hello, Jordan!')

  const notMatched = await request('/api/matches/999999/messages', {
    cookie: woman.cookie,
  })
  assert.equal(notMatched.response.status, 404)

  const womanEveryone = await register('+15550001004', {
    name: 'Casey', age: 28, gender: 'Woman', lookingFor: ['Everyone'],
    location: 'Toronto', bio: '', interests: ['Travel', 'Art'],
  })
  const travelProfileIds = ['ananya@example.com', 'saanvi@example.com', 'riya@example.com']
    .map((email) => db.prepare('SELECT id FROM users WHERE email = ?').get(email).id)
  for (const account of [man, nonBinary, womanEveryone]) {
    for (const targetUserId of travelProfileIds) {
      const like = await request('/api/swipes', {
        method: 'POST',
        cookie: account.cookie,
        body: { targetUserId, action: 'like' },
      })
      assert.ok([200, 201].includes(like.response.status))
    }
  }

  const trends = await request('/api/trending', { cookie: woman.cookie })
  assert.equal(trends.response.status, 200)
  assert.ok(trends.data.interests.some((interest) => interest.name === 'Travel'))

  localCode = ''
  const requestedLogin = await request('/api/auth/request-code', {
    method: 'POST',
    body: { phoneNumber: '+15550001001' },
  })
  assert.equal(requestedLogin.response.status, 202)
  assert.equal(localCode, '12345')
  const login = await request('/api/auth/verify-code', {
    method: 'POST',
    body: { phoneNumber: '+15550001001', code: localCode },
  })
  assert.equal(login.response.status, 200)
  assert.equal(login.data.profileRequired, false)
  const state = await request('/api/auth/state', { cookie: cookieFrom(login.response) })
  assert.equal(state.data.authenticated, true)
})
