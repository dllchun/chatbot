import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPEN_AI_KEY missing");
}

const openai = new OpenAI({ apiKey });

if (!openai) {
  throw new Error("OPEN_AI agent error");
}

export default openai;

// Embedding

export async function getEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  const embedding = response.data[0].embedding;

  if (!embedding) throw new Error("Error generating embedding");
  console.log(embedding);
  return embedding;
}
