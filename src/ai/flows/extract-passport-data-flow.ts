'use server';
/**
 * @fileOverview An AI agent that extracts structured data from a passport photo.
 */

import { ai } from '@/ai/genkit';
import { PassportDataSchema, type PassportDataOutput, ExtractPassportDataInputSchema, type ExtractPassportDataInput } from '@/types/ai/passport-data';


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
        model: 'googleai/gemini-1.5-flash',
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
