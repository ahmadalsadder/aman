import { z } from 'genkit';

export const PassportDataSchema = z.object({
  firstName: z.string().describe("The passenger's first name."),
  lastName: z.string().describe("The passenger's last name."),
  passportNumber: z.string().describe('The passport number.'),
  nationality: z.string().describe('The 3-letter ISO code for the nationality (e.g., USA, GBR).'),
  dateOfBirth: z.string().describe('The date of birth in YYYY-MM-DD format.'),
  gender: z.enum(['Male', 'Female', 'Other']).describe("The passenger's gender."),
  passportIssueDate: z.string().describe('The passport issue date in YYYY-MM-DD format.'),
  passportExpiryDate: z.string().describe('The passport expiry date in YYYY-MM-DD format.'),
  passportCountry: z.string().describe('The 3-letter ISO code for the issuing country.'),
});
export type PassportDataOutput = z.infer<typeof PassportDataSchema>;


export const ExtractPassportDataInputSchema = z.object({
    passportPhotoDataUri: z.string().describe("A photo of a passport's data page, as a data URI."),
});
export type ExtractPassportDataInput = z.infer<typeof ExtractPassportDataInputSchema>;