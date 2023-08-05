const request = require('supertest');
const app = require('./index.js'); // replace with path to your Express.js app
const { Model, WeatherModel, UserModel, CommentModel } = require('./models/model'); // replace with path to your user model

describe('GET /getAll', () => {
    it('should response 200', async () => {
        const res = await request(app).get('/api/getAll');
        expect(res.statusCode).toBe(200);
    });
});
describe('GET /comment/getAll', () => {
    it('should response 200', async () => {
        const res = await request(app).get('/api/comment/getAll');
        expect(res.statusCode).toBe(200);
    });
});
describe('POST /comment', () => {
    const staff = { username: 'k5089898', password: 'Kk61561690' };

    beforeAll(async () => {
        await UserModel.deleteMany({});
        await UserModel.create(staff);
        const response = await request(app).post('/api/user/login').send({
            username: staff.username,
            password: staff.password,
        });

        token = response.body.data.token;
    });
    describe('when token is correct', () => {
        it('Post a comment', async () => {
            const res = await request(app).post('/api/comment').set('Authorization', `Bearer ${token}`).send({
                username: 'k5089898',
                content: 'Test',
                date: new Date(),
            });
            expect(res.statusCode).toBe(200);
        });
    });
    describe('when token is wrong', () => {
        it('should return 401', async () => {
            const res = await request(app).post('/api/comment').set('Authorization', `Bearer ${token}123`).send({
                username: 'k5089898',
                content: 'Test',
                date: new Date(),
            });
            expect(res.statusCode).toBe(401);
        });
    });
});
describe('GET /groupByIncident', () => {
    it('Show the data which grouped by incident', async () => {
        const res = await request(app).get('/api/groupByIncident');
        expect(res.statusCode).toBe(200);
    });
});
describe('GET /groupByYears', () => {
    it('Show the data which grouped by year', async () => {
        const res = await request(app).get('/api/groupByYears');
        expect(res.statusCode).toBe(200);
    });
});

describe('POST /indident-weather', () => {
    it('get the chart combined with weather and incident', async () => {
        const res = await request(app).post('/api/indident-weather').set('Authorization', `Bearer ${token}`).send({
            year: 2017,
            filter: 'HighestTemperature_Celsius',
        });
        expect(res.statusCode).toBe(200);
    });
});
describe('POST /user/register', () => {
    const existingUser = { username: 'existinguser', password: 'Existing123' };
    const newUser = { username: 'k5089898', password: 'Kk61561690' };
    const wrongformatuser = { username: 'test', password: 'test' };
    beforeAll(async () => {
        await UserModel.deleteMany({});
        await UserModel.create(existingUser);
    });

    describe('user alreay exists', () => {
        it('returns an error if username already exists', async () => {
            const res = await request(app).post('/api/user/register').send(existingUser);
            expect(res.statusCode).toBe(400);
        });
    });
    describe('wrong format', () => {
        it('returns an error if the format does not match the requirement', async () => {
            const res = await request(app).post('/api/user/register').send(wrongformatuser);
            expect(res.statusCode).toBe(400);
        });
    });

    describe('user register', () => {
        it('should response 200', async () => {
            const res = await request(app).post('/api/user/register').send(newUser);
            expect(res.statusCode).toBe(200);
        });
    });
});
describe('POST /user/login', () => {
    describe('user login', () => {
        it('should response 200', async () => {
            const res = await request(app).post('/api/user/login').send({
                username: 'k5089898',
                password: 'Kk61561690',
            });
            expect(res.statusCode).toBe(200);
        });
    });
});

describe('POST /user/getUser', () => {
    const staff = { username: 'k5089898', password: 'Kk61561690' };

    beforeAll(async () => {
        await UserModel.deleteMany({});
        await UserModel.create(staff);
        const response = await request(app).post('/api/user/login').send({
            username: staff.username,
            password: staff.password,
        });

        token = response.body.data.token;
    });
    it('should respones 200', async () => {
        const res = await request(app).post('/api/user/getUser').send({
            token: token,
        });
        expect(res.statusCode).toBe(200);
    });
});
