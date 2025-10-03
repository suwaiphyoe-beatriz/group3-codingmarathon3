const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const User = require('../models/userModel');

describe('User Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should signup a new user when POST /api/users/signup is called with all fields', async () => {
    const newUser = {
      name: 'Alice Tester',
      username: `alice_${Date.now()}`,
      password: 'password123',
      phone_number: '1234567890',
      gender: 'female',
      date_of_birth: new Date(1995, 6, 15).toISOString(),
      membership_status: 'free'
    };

    const res = await api
      .post('/api/users/signup')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(res.body.username).toBe(newUser.username);
    expect(res.body.token).toBeDefined();

    const users = await User.find({});
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe(newUser.username);
  });

  it('should return 400 when POST /api/users/signup missing fields', async () => {
    const badUser = {
      name: 'Bob',
      username: 'bob',
      // missing many required fields
    };

    await api.post('/api/users/signup').send(badUser).expect(400);
  });

  it('should login an existing user with correct credentials', async () => {
    const user = {
      name: 'Carol',
      username: `carol_${Date.now()}`,
      password: 'secret!',
      phone_number: '0987654321',
      gender: 'non-binary',
      date_of_birth: new Date(1992, 3, 10).toISOString(),
      membership_status: 'premium'
    };

    // signup first
    await api.post('/api/users/signup').send(user).expect(201);

    const loginRes = await api
      .post('/api/users/login')
      .send({ username: user.username, password: user.password })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(loginRes.body.username).toBe(user.username);
    expect(loginRes.body.token).toBeDefined();
  });

  it('should return 400 for login with wrong credentials', async () => {
    await api.post('/api/users/login').send({ username: 'noone', password: 'bad' }).expect(400);
  });

  it('should return user info for GET /api/users/me when authorized', async () => {
    const user = {
      name: 'Dave',
      username: `dave_${Date.now()}`,
      password: 'mypass',
      phone_number: '1112223333',
      gender: 'male',
      date_of_birth: new Date(1990, 1, 1).toISOString(),
      membership_status: 'free'
    };

    // signup and login
    await api.post('/api/users/signup').send(user).expect(201);
    const loginRes = await api.post('/api/users/login').send({ username: user.username, password: user.password }).expect(200);
    const token = loginRes.body.token;

    const meRes = await api.get('/api/users/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(meRes.body).toBeDefined();
    // should include _id or id (controller returns req.user which selects _id)
    expect(meRes.body._id || meRes.body.id).toBeDefined();
  });

  it('should return 401 for GET /api/users/me without token', async () => {
    await api.get('/api/users/me').expect(401);
  });
});
