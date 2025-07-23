'use server';

/**
 * @fileOverview An AI agent that assesses passenger risk based on various inputs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AssessPassengerRiskInputSchema = z.object({
  passengerDetails: z.object({
    nationality: z.string().describe('The passenger\'s nationality.'),
    dateOfBirth: z.string().describe('The passenger\'s date of birth in YYYY-MM-DD format.'),
    riskLevel: z.string().describe('The passenger\'s current risk level (Low, Medium, High).'),
  }),
  passportPhotoDataUri: z.string().describe("The passenger's passport photo as a data URI."),
  livePhotoDataUri: z.string().describe("A live photo of the passenger as a data URI."),
});
export type AssessPassengerRiskInput = z.infer<typeof AssessPassengerRiskInputSchema>;

const AssessPassengerRiskOutputSchema = z.object({
  riskScore: z.number().describe('A risk score from 0 to 100.'),
  assessment: z.string().describe('A summary of the risk assessment.'),
  recommendation: z.enum(['Approve', 'Reject', 'Review']).describe('The recommended action.'),
  alerts: z.array(z.string()).describe('A list of triggered risk alerts.'),
  faceMatch: z.object({
    isMatch: z.boolean().describe('Whether the live photo matches the passport photo.'),
    confidence: z.number().describe('The confidence score of the face match (0 to 100).'),
  }),
});
export type AssessPassengerRiskOutput = z.infer<typeof AssessPassengerRiskOutputSchema>;

export async function assessPassengerRisk(input: AssessPassengerRiskInput): Promise<AssessPassengerRiskOutput> {
  return assessPassengerRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessPassengerRiskPrompt',
  input: { schema: AssessPassengerRiskInputSchema },
  output: { schema: AssessPassengerRiskOutputSchema },
  prompt: `
    You are a border security AI. Your task is to assess the risk of a passenger based on their details and a face match between their passport and a live photo.

    Passenger Details:
    - Nationality: {{{passengerDetails.nationality}}}
    - Date of Birth: {{{passengerDetails.dateOfBirth}}}
    - Current Risk Level: {{{passengerDetails.riskLevel}}}

    Photos for comparison:
    - Passport Photo: {{media url=passportPhotoDataUri}}
    - Live Photo: {{media url=livePhotoDataUri}}

    Instructions:
    1.  **Face Match**: Compare the passport photo and the live photo. Determine if they are the same person and provide a confidence score.
    2.  **Risk Assessment**: Based on all available information (passenger details, face match result), calculate a risk score from 0-100. Provide a brief text assessment explaining your reasoning.
    3.  **Recommendation**: Based on the risk score, recommend one of the following actions: 'Approve', 'Reject', or 'Review'.
        - Approve: Low risk (score 0-40)
        - Review: Medium risk (score 41-75)
        - Reject: High risk (score 76-100)
    4.  **Alerts**: List any specific alerts triggered. For example: "Face match confidence low", "Passenger on watchlist", "Irregular travel pattern". If the face match is low, this alert is mandatory.

    Produce the output in the specified JSON format.
  `,
});

const assessPassengerRiskFlow = ai.defineFlow(
  {
    name: 'assessPassengerRiskFlow',
    inputSchema: AssessPassengerRiskInputSchema,
    outputSchema: AssessPassengerRiskOutputSchema,
  },
  async (input) => {
    // In a real scenario, you might have more complex logic here,
    // like checking against watchlists, analyzing travel history, etc.
    // For this mock, we will rely on the prompt to generate a plausible result.
    const { output } = await prompt(input);
    return output!;
  }
);
