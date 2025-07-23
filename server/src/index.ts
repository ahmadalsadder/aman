'use server';

import express, { type Request, type Response, Router } from 'express';
import cors from 'cors';
import { users } from './data/users';
import { Result, ApiError } from './result';
import { config } from 'dotenv';

config();

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Router
const apiRouter = Router();

apiRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(Result.failure([new ApiError('BAD_REQUEST', 'Email and password are required.')]));
  }

  const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json(Result.failure([new ApiError('UNAUTHORIZED', 'Invalid credentials.')]));
  }
  
  // In a real app, you would also validate the password. We are skipping that for this demo.

  res.status(200).json(Result.success(user));
});


apiRouter.get('/dashboard/stats', (req: Request, res: Response) => {
  res.json(Result.success({
    totalAnomalies: 12,
    monitoredEndpoints: 42,
    uptimePercentage: 99.9,
  }));
});

apiRouter.get('/dashboard/stats-error', (req: Request, res: Response) => {
    res.status(401).send(`{ "error": "invalid_token", "error_description": "The access token is expired or invalid", "user_id": 12345, "internal_debug_info": "trace_id: xyz-abc-123" }`);
});

// Use the API router with the /api prefix
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Guardian Gate server listening on port ${port}`);
});
