import express, { type Request, type Response, Router } from 'express';
import cors from 'cors';
import { users } from './data/users';
import type { User } from './types';
import { Result, ApiError } from './result';
import { config } from 'dotenv';

config();


const app = express();
const port = 3001;

// A real app would have a more restrictive CORS policy.
// For this demo, we will allow requests from any origin.
app.use(cors());
app.use(express.json());

const apiRouter = Router();

apiRouter.post('/login', (req: Request, res: Response) => {
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

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Guardian Gate server listening on port ${port}`);
});
