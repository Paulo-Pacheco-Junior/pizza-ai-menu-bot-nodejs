import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("A variável GEMINI_API_KEY não está definida no .env");
}

export const env = {
  GEMINI_API_KEY,
};
