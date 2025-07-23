import { config } from 'dotenv';
config();

import '@/ai/flows/flag-edge-case-responses.ts';
import '@/ai/flows/assess-risk-flow.ts';
import '@/ai/flows/extract-passport-data-flow.ts';
