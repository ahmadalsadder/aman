"use strict";
'use server';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const users_1 = require("./data/users");
const result_1 = require("./result");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = 3001;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Router
const apiRouter = (0, express_1.Router)();
apiRouter.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json(result_1.Result.failure([new result_1.ApiError('BAD_REQUEST', 'Email and password are required.')]));
    }
    const user = users_1.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return res.status(401).json(result_1.Result.failure([new result_1.ApiError('UNAUTHORIZED', 'Invalid credentials.')]));
    }
    // In a real app, you would also validate the password. We are skipping that for this demo.
    res.status(200).json(result_1.Result.success(user));
});
apiRouter.get('/dashboard/stats', (req, res) => {
    res.json(result_1.Result.success({
        totalAnomalies: 12,
        monitoredEndpoints: 42,
        uptimePercentage: 99.9,
    }));
});
apiRouter.get('/dashboard/stats-error', (req, res) => {
    res.status(401).send(`{ "error": "invalid_token", "error_description": "The access token is expired or invalid", "user_id": 12345, "internal_debug_info": "trace_id: xyz-abc-123" }`);
});
// Use the API router with the /api prefix
app.use('/api', apiRouter);
app.listen(port, () => {
    console.log(`Guardian Gate server listening on port ${port}`);
});
