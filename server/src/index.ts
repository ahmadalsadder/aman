'use server';
import express from 'express';
import cors from 'cors';
import { users } from './data/users';
import type { User } from './types';
import { Result, ApiError } from './result';
import { config } from 'dotenv';

config();


const app = express();
const port = 3001;

// A real app would have a more restrictive CORS policy.
// For this demo, we will allow requests from the Next.js dev server.
const corsOptions = {
  origin: 'http://localhost:9002',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // In a real app, you'd hash and compare the password
  if (!email || !password) {
    return res.status(400).json(Result.failure([new ApiError('BAD_REQUEST', 'Email and password are required.')]));
  }

  const user = users.find(u => u.email === email);

  if (user && password === 'password') {
    // In a real app, generate a real JWT
    const { permissions, ...userWithoutPermissions } = user;
    res.json(Result.success(user));
  } else {
    res.status(401).json(Result.failure([new ApiError('UNAUTHORIZED', 'Invalid email or password.')]));
  }
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json(Result.success({
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
