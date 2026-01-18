'use server';
/**
 * @fileOverview A flow to generate an image for a raffle result.
 *
 * - generateResultImage - A function that handles the image generation.
 * - GenerateResultImageInput - The input type for the generateResultImage function.
 * - GenerateResultImageOutput - The return type for the generateResultImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResultImageInputSchema = z.object({
  listName: z.string().describe('The name of the list that was drawn.'),
  winners: z.array(z.string()).describe('The names of the winners.'),
});
export type GenerateResultImageInput = z.infer<typeof GenerateResultImageInputSchema>;

const GenerateResultImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateResultImageOutput = z.infer<typeof GenerateResultImageOutputSchema>;

export async function generateResultImage(
  input: GenerateResultImageInput
): Promise<GenerateResultImageOutput> {
  return generateResultImageFlow(input);
}

const generateResultImageFlow = ai.defineFlow(
  {
    name: 'generateResultImageFlow',
    inputSchema: GenerateResultImageInputSchema,
    outputSchema: GenerateResultImageOutputSchema,
  },
  async ({listName, winners}) => {
    const winnersText = winners.join(', ');
    const prompt = `
      Create a visually appealing and celebratory image to announce the winners of a raffle.
      The image should look like a certificate or an official announcement.
      Use a color scheme with soft blue (#A0D2EB), light purple (#B290E3), and a very light blue (#F0F8FF) background.
      The title of the raffle is: "Resultado do Sorteio: ${listName}"
      The winner(s) are: "${winnersText}"
      The image should contain trophy or gift icons.
      The text should be elegant and easy to read.
      Generate a high-quality image suitable for sharing on social media like Instagram or Facebook.
      The style should be clean and modern.
    `;

    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: prompt,
    });

    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return {imageDataUri: media.url};
  }
);
