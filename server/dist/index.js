"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const users_1 = require("./data/users");
const result_1 = require("./result");
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // In a real app, you'd hash and compare the password
    if (!email || !password) {
        return res.status(400).json(result_1.Result.failure([new result_1.ApiError('BAD_REQUEST', 'Email and password are required.')]));
    }
    const user = users_1.users.find(u => u.email === email);
    if (user && password === 'password') {
        // In a real app, generate a real JWT
        const { permissions } = user, userWithoutPermissions = __rest(user, ["permissions"]);
        res.json(result_1.Result.success(user));
    }
    else {
        res.status(401).json(result_1.Result.failure([new result_1.ApiError('UNAUTHORIZED', 'Invalid email or password.')]));
    }
});
app.get('/api/dashboard/stats', (req, res) => {
    res.json(result_1.Result.success({
        totalAnomalies: 12,
        monitoredEndpoints: 42,
        uptimePercentage: 99.9,
    }));
});
app.get('/api/dashboard/stats-error', (req, res) => {
    res.status(401).send(`{ "error": "invalid_token", "error_description": "The access token is expired or invalid", "user_id": 12345, "internal_debug_info": "trace_id: xyz-abc-123" }`);
});
app.listen(port, () => {
    console.log(`Guardian Gate server listening on port ${port}`);
});
