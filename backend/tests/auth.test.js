const request = require('supertest')
const app = require('../server')
const User = require('../models/User')

describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('Should register a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'donor'
      })
      .expect(200)

    expect(response.body).toHaveProperty('token')
  })
})