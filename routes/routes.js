const express = require('express');
const { Model, WeatherModel, UserModel, CommentModel } = require('../models/model');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const mongoString = process.env.JWT_SECRET;
const verify = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, mongoString, (err, user) => {
        if (err) {
            return res.status(401).json({
                status: 'error',
                code: res.statusCode,
                data: null,
                message: 'Unauthorized',
            });
        }
        let objectId;
        try {
            objectId = new mongoose.Types.ObjectId(user._id);
            next();
        } catch (err) {
            return res.status(400).json({
                status: 'error',
                code: res.statusCode,
                data: null,
                message: 'Invalid id',
            });
        }
    });
};
/**
 * @openapi
 * /api/getAll:
 *   get:
 *     summary: get all the data
 *     tags:
 *       - Common
 *     description: user can get data of all the mountain accidents
 *     responses:
 *       200:
 *         description: get data success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: id of the incident
 *                   example: 6446ba12bf5a0519f90c7ce0
 *                 incident:
 *                   type: string
 *                   description: type of incident
 *                   example: Cave/Mine Exploration
 *                 injury:
 *                   type: string
 *                   description: the injury situation
 *                   example: Fatal
 *                 amount:
 *                   type: number
 *                   description: amount
 *                   example: 0
 *                 total:
 *                   type: number
 *                   description: total amount
 *                   example: 1
 *                 year:
 *                   type: number
 *                   description: year
 *                   example: 2017
 *       500:
 *         description: server error
 */
router.get('/getAll', async (req, res) => {
    try {
        const data = await Model.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/**
 * @openapi
 * /api/comment/getAll:
 *   get:
 *     summary: get all the comments
 *     tags:
 *       - Comment
 *     description: user can get all the comments
 *     responses:
 *       200:
 *         description: get comments success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: id of the comment
 *                   example: 64ba3d851176e1eb9fb9f899
 *                 username:
 *                   type: string
 *                   description: user who post the comment
 *                   example: k5089898
 *                 content:
 *                   type: string
 *                   description: the coment of the comment
 *                   example: test
 *                 date:
 *                   type: number
 *                   description: comment posted date
 *                   example: Fri Jul 21 2023 16:10:45 GMT+0800 (Hong Kong Standard Time)
 *       500:
 *         description: server error
 */

router.get('/comment/getAll', async (req, res) => {
    try {
        const data = await CommentModel.find();
        res.json(data);
    } catch (error) {
        console.log(err);
        res.status(500).json({ message: error.message });
    }
});
/**
 * @openapi
 * /api/comment:
 *   post:
 *     summary: post comments
 *     tags:
 *       - Comment
 *     description: user can post comment to the db
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: ''
 *           example:
 *             username: k5089898
 *             content: test
 *     responses:
 *       200:
 *         description: post comments success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: user who post the comment
 *                   example: k5089898
 *                 content:
 *                   type: string
 *                   description: conent posted
 *                   example: test
 *                 date:
 *                   type: string
 *                   description: comment posted date
 *                   example: Fri Aug 04 2023 18:43:17 GMT+0800 (Hong Kong Standard Time)
 *                 _id:
 *                   type: string
 *                   description: comment id
 *                   example: 64ccd64568c4aebdcb455f56
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: user not exist
 *       500:
 *         description: server error
 */

router.post('/comment', verify, async (req, res) => {
    try {
        const existingUser = await UserModel.findOne({ username: req.body.username });
        if (!existingUser) {
            return res.status(404).json({
                status: 'error',
                code: res.statusCode,
                data: null,
                message: 'Username not found.',
            });
        }
        const { username, content } = req.body;
        const data = new CommentModel({
            username: req.body.username,
            content: req.body.content,
            date: new Date(),
        });
        const dataToSave = await data.save();
        res.status(200).json({ status: 'success', code: res.statusCode, data: dataToSave });
        res.send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});
/**
 * @openapi
 * /api/groupByIncident:
 *   get:
 *     summary: get data that group by incident
 *     tags:
 *       - Common
 *     description: get all the data that groupded by incident
 *     responses:
 *       200:
 *         description: get data success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: type of incident
 *                   example: Deer Stalking
 *                 total:
 *                   type: number
 *                   description: total amount
 *                   example: 6
 *       500:
 *         description: server error
 */

router.get('/groupByIncident', async (req, res) => {
    try {
        const data = await Model.aggregate([
            { $match: {} },
            {
                $group: {
                    _id: '$incident',
                    total: {
                        $sum: '$amount',
                    },
                },
            },
            { $sort: { total: 1 } },
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/allInvolvedYear', async (req, res) => {
    try {
        const data = await Model.aggregate([
            {
                $group: {
                    _id: '$year',
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $group: {
                    _id: null,
                    years: {
                        $push: '$_id',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    years: 1,
                },
            },
        ]);
        res.json(...data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/groupByYears:
 *   get:
 *     summary: get data that group by year
 *     tags:
 *       - Common
 *     description: get all the data that groupded by year
 *     responses:
 *       200:
 *         description: get data success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 incident:
 *                   type: string
 *                   description: type of incident
 *                   example: Abseiling
 *                 data:
 *                   type: object
 *                   properties:
 *                     2014:
 *                       type: number
 *                       description: number of the year
 *                       example: 12
 *                     2015:
 *                       type: number
 *                       description: number of the year
 *                       example: 14
 *       500:
 *         description: server error
 */

router.get('/groupByYears', async (req, res) => {
    try {
        const data = await Model.aggregate([
            {
                $group: {
                    _id: {
                        incident: '$incident',
                        year: '$year',
                    },
                    totalAmount: { $sum: '$amount' },
                },
            },
            {
                $group: {
                    _id: '$_id.incident',
                    data: {
                        $push: {
                            k: { $toString: '$_id.year' },
                            v: '$totalAmount',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    incident: '$_id',
                    data: { $arrayToObject: '$data' },
                },
            },
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/indident-weather:
 *   post:
 *     summary: filter the data with incident and weather
 *     tags:
 *       - Common
 *     description: user can get data combined with incident and weather
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: ''
 *           example:
 *             year: 2016
 *             filter: HighestTemperature_Celsius
 *     responses:
 *       200:
 *         description: post comments success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: id of the data
 *                   example: 64838ca02d5c54be3a0e3571
 *                 Amount:
 *                   type: number
 *                   description: amount of the accident
 *                   example: 150
 *                 HighestTemperature_Celsius:
 *                   type: number
 *                   description: highest temperature of the month
 *                   example: 16.1
 *                 year:
 *                   type: number
 *                   description: year of the month
 *                   example: 2016
 *       500:
 *         description: server error
 */
const test = {
    _id: '64838ca02d5c54be3a0e3571',
    Amount: 150,
    HighestTemperature_Celsius: 16.1,
    year: 2016,
};
router.post('/indident-weather', async (req, res) => {
    console.log(req.body);
    const { year, filter } = req.body;
    try {
        let data;
        if (filter.length > 0) {
            data = await WeatherModel.aggregate([
                { $match: { year: year } },
                { $project: { year: 1, [filter]: 1, Amount: 1 } },
            ]);
        } else {
            data = await WeatherModel.find({ year: year });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/**
 * @openapi
 * /api/user/register:
 *   post:
 *     summary: Register for a user
 *     tags:
 *       - User
 *     description: user can register as a normal user or a staff by register with the staff code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: ''
 *           example:
 *             username: k5089898
 *             password: Kk61561690
 *     responses:
 *       200:
 *         description: register successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The user ID.
 *                 username:
 *                   type: string
 *                   description: The username.
 *       403:
 *         description: username or password not meet the requirement
 */
router.post('/user/register', async (req, res) => {
    const existingUser = await UserModel.findOne({ username: req.body.username });
    if (existingUser) {
        return res.status(400).json({
            status: 'error',
            code: res.statusCode,
            data: null,
            message: 'Username already exists.',
        });
    }
    const { username, password } = req.body;
    const data = new UserModel({
        username: req.body.username,
        password: req.body.password,
        // isStaff: req.body.staffCode == '0000',
    });
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);

    if (!hasUppercase || !hasLowercase) {
        return res.status(400).json({
            status: 'error',
            code: res.statusCode,
            data: null,
            message: 'Password must contain both uppercase and lowercase letters.',
        });
    }
    if (username.length <= 7) {
        return res.status(403).json({
            status: 'error',
            code: res.statusCode,
            data: null,
            message: 'Username must includes more than 7 charactors.',
        });
    }
    if (password.length <= 7) {
        return res.status(403).json({
            status: 'error',
            code: res.statusCode,
            data: null,
            message: 'Password must includes more than 7 charactors.',
        });
    }
    const dataToSave = await data.save();
    console.log(res);
    res.status(200).json({ status: 'success', code: res.statusCode, data: dataToSave });
    res.send();
});
router.post('/user/getUser', async (req, res) => {
    const { token } = req.body;
    console.log(req.body);
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, mongoString, (err, user) => {
        let objectId;
        try {
            objectId = new mongoose.Types.ObjectId(user._id);
        } catch (err) {
            return res.status(400).json({
                status: 'error',
                code: res.statusCode,
                data: null,
                message: 'Invalid id',
            });
        }
        mongoose
            .model('user')
            .findById(objectId)
            .then((r) => {
                res.status(200).json({
                    status: 'success',
                    code: res.statusCode,
                    data: { username: r.username, isStaff: r.isStaff, favourite: r.favourite },
                });
            });
    });
});
/**
 * @openapi
 * /api/user/login:
 *   post:
 *     summary: Login for a user
 *     tags:
 *       - User
 *     description: user login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: ''
 *           example:
 *             username: k5089898
 *             password: Kk61561690
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The user ID.
 *                 username:
 *                   type: string
 *                   description: The username.
 *                 token:
 *                   type: string
 *                   description: token that to identify user
 *                 favourite:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: array that shows user's favourite cats
 *       401:
 *         description: Username or password is incorrect
 */
router.post('/user/login', async (req, res) => {
    const { username, passowrd } = req.body;
    const user = await UserModel.findOne({ username: username });

    if (!user) {
        return res.status(401).json({
            status: 'error',
            code: res.statusCode,
            data: null,
            message: 'Username or password is incorrect',
        });
    }

    // check password
    if (req.body.password !== user.password) {
        return res.status(401).json({
            status: 'error',
            code: res.statusCode,
            data: null,
            message: 'Username or password is incorrect',
        });
    }
    const token = jwt.sign({ _id: user._id }, mongoString, { expiresIn: '1h' });
    res.header('auth-token', token).json({
        status: 'success',
        code: res.statusCode,
        data: { token: token, isStaff: user.isStaff, favourite: user.favourite, username: user.username },
        message: 'Login asd successful',
    });
});
module.exports = router;
