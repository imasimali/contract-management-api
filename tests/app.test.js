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

  test('POST /jobs/:jobId/pay - should not allow payment if balance is insufficient', async () => {
    const res = await request(app).post('/jobs/3/pay').set('profile_id', '4');
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Insufficient balance');
  });

  test('POST /jobs/:jobId/pay - should allow payment if balance is sufficient', async () => {
    const res = await request(app).post('/jobs/3/pay').set('profile_id', '1');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Payment successful');
  });
});

describe('API tests for balances', () => {
  test('POST /balances/deposit/:userId - should reject deposit over 25% of total jobs to pay', async () => {
    const res = await request(app).post('/balances/deposit/1').send({ amount: 1000 }).set('profile_id', '1');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Deposit limit exceeded');
  });

  test('POST /balances/deposit/:userId - should allow deposit within 25% of total jobs to pay', async () => {
    const res = await request(app).post('/balances/deposit/1').send({ amount: 200 }).set('profile_id', '1');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Deposit successful');
  });
});
