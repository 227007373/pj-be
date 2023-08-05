const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({}, { collection: 'mountain_accident' });
const weatherDataSchema = new mongoose.Schema({}, { collection: 'mountain_accident_weather' });
const userDataSchema = new mongoose.Schema(
    {
        username: {
            type: 'string',
            required: true,
        },
        password: {
            type: 'string',
            required: true,
        },
    },
    { collection: 'user' }
);
const commentDataSchema = new mongoose.Schema(
    {
        username: {
            type: 'string',
            required: true,
        },
        content: {
            type: 'string',
            required: true,
        },
        date: {
            type: 'string',
            required: false,
        },
    },
    { collection: 'comments' }
);

const model = mongoose.model('mountain_accident', dataSchema);
const weatherModel = mongoose.model('mountain_accident_weather', weatherDataSchema);
const userModel = mongoose.model('user', userDataSchema);
const commentModel = mongoose.model('comments', commentDataSchema);
module.exports = {
    Model: model,
    WeatherModel: weatherModel,
    UserModel: userModel,
    CommentModel: commentModel,
};
