const request       = require('supertest');
const app           = require('../src/app');
const { sequelize } = require('../src/models');
const { seed }      = require('../scripts/seedDb');

beforeAll(async () => {
  await seed();
});

afterAll(() => {
  sequelize.close();
});

describe('API tests for contracts', () => {
  test('GET /contracts/:id - should handle unauthorized access', async () => {
    const res = await request(app).get('/contracts/1').set('profile_id', 'nonexistent');
    expect(res.status).toBe(401);
  });

  test('GET /contracts/:id - should deny access for wrong user', async () => {
    const res = await request(app).get('/contracts/3').set('profile_id', '1');
    expect(res.status).toBe(403);
  });

  test('GET /contracts - should return only non-terminated contracts for the logged-in user', async () => {
    const res = await request(app).get('/contracts').set('profile_id', '1');
    expect(res.status).toBe(200);
    res.body.forEach((contract) => {
      expect(contract.status).not.toBe('terminated');
    });
  });
});

describe('API tests for jobs', () => {
  test('GET /jobs/unpaid - should return only unpaid jobs for active contracts', async () => {
    const res = await request(app).get('/jobs/unpaid').set('profile_id', '1');
    expect(res.status).toBe(200);
    res.body.forEach((job) => {
      expect(job.paid).toBe(false);
      expect(['in_progress']).toContain(job.Contract.status);
    });
  });
});
