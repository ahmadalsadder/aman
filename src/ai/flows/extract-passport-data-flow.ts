'use server';
/**
 * @fileOverview An AI agent that extracts structured data from a passport photo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const PassportDataSchema = z.object({
  firstName: z.string().describe("The passenger's first name."),
  lastName: z.string().describe("The passenger's last name."),
  passportNumber: z.string().describe('The passport number.'),
  nationality: z.string().describe('The 3-letter ISO code for the nationality (e.g., USA, GBR).'),
  dateOfBirth: z.string().describe('The date of birth in YYYY-MM-DD format.'),
  gender: z.enum(['Male', 'Female', 'Other']).describe('The passenger\'s gender.'),
  passportIssueDate: z.string().describe('The passport issue date in YYYY-MM-DD format.'),
  passportExpiryDate: z.string().describe('The passport expiry date in YYYY-MM-DD format.'),
  passportCountry: z.string().describe('The 3-letter ISO code for the issuing country.'),
});
export type PassportDataOutput = z.infer<typeof PassportDataSchema>;


const ExtractPassportDataInputSchema = z.object({
    passportPhotoDataUri: z.string().describe("A photo of a passport's data page, as a data URI."),
});
export type ExtractPassportDataInput = z.infer<typeof ExtractPassportDataInputSchema>;


export async function extractPassportData(input: ExtractPassportDataInput): Promise<PassportDataOutput> {
    return extractPassportDataFlow(input);
}


const prompt = ai.definePrompt({
    name: 'extractPassportDataPrompt',
    input: { schema: ExtractPassportDataInputSchema },
    output: { schema: PassportDataSchema },
    prompt: `
        You are an expert at reading passports. Extract the following information from the provided passport image.
        Provide the output in the specified JSON format.

        Passport Image: {{media url=passportPhotoDataUri}}
    `,
});

const extractPassportDataFlow = ai.defineFlow(
    {
        name: 'extractPassportDataFlow',
        inputSchema: ExtractPassportDataInputSchema,
        outputSchema: PassportDataSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
