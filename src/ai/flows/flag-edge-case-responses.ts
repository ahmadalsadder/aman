'use server';

/**
 * @fileOverview An AI agent that flags edge case API responses that could indicate security issues.
 *
 * - flagEdgeCaseResponse - A function that handles the edge case response flagging process.
 * - FlagEdgeCaseResponseInput - The input type for the flagEdgeCaseResponse function.
 * - FlagEdgeCaseResponseOutput - The return type for the flagEdgeCaseResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlagEdgeCaseResponseInputSchema = z.object({
  apiResponse: z.string().describe('The API response to analyze.'),
  apiEndpoint: z.string().describe('The API endpoint that generated the response.'),
  userRole: z.string().describe('The role of the user who made the request.'),
});
export type FlagEdgeCaseResponseInput = z.infer<typeof FlagEdgeCaseResponseInputSchema>;

const FlagEdgeCaseResponseOutputSchema = z.object({
  isEdgeCase: z.boolean().describe('Whether the API response is considered an edge case that might indicate a security issue.'),
  reason: z.string().describe('The reason why the API response is considered an edge case.'),
  severity: z.enum(['low', 'medium', 'high']).describe('The severity of the potential security issue.'),
});
export type FlagEdgeCaseResponseOutput = z.infer<typeof FlagEdgeCaseResponseOutputSchema>;

export async function flagEdgeCaseResponse(input: FlagEdgeCaseResponseInput): Promise<FlagEdgeCaseResponseOutput> {
  return flagEdgeCaseResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flagEdgeCaseResponsePrompt',
  input: {schema: FlagEdgeCaseResponseInputSchema},
  output: {schema: FlagEdgeCaseResponseOutputSchema},
  prompt: `You are a security analyst tasked with identifying edge case API responses that could indicate security issues.

You will be provided with an API response, the API endpoint that generated the response, and the role of the user who made the request.

Based on this information, you will determine whether the API response is an edge case that might indicate a security issue. If it is, you will provide a reason why it is considered an edge case and the severity of the potential security issue (low, medium, or high).

API Endpoint: {{{apiEndpoint}}}
User Role: {{{userRole}}}
API Response: {{{apiResponse}}}

Consider the following:
- Unexpected data types or formats in the response.
- Error codes that are not properly handled.
- Responses that contain sensitive information that should not be exposed to the user.
- Responses that indicate unauthorized access or privilege escalation.
- Rate limiting or throttling issues.
- Input validation failures.
- Authentication or authorization failures.
- Common security vulnerabilities like SQL injection, cross-site scripting (XSS), or command injection.
`,
});

const flagEdgeCaseResponseFlow = ai.defineFlow(
  {
    name: 'flagEdgeCaseResponseFlow',
    inputSchema: FlagEdgeCaseResponseInputSchema,
    outputSchema: FlagEdgeCaseResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
