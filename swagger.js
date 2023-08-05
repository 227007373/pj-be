'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const swaggerUi = require('swagger-ui-express');
const express_1 = __importDefault(require('express'));
const swagger_jsdoc_1 = __importDefault(require('swagger-jsdoc'));
const app = (0, express_1.default)();
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mountain accident',
            version: '1.0.0',
            description: 'Mountain accident data analyst System API',
        },
    },
    apis: ['./routes/routes.js'], // Path to the API routes
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
module.exports = app;
