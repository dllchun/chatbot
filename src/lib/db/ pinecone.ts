import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw new Error("PINECONE_API_KEY missing");
}

const pinecone = new Pinecone({
  apiKey: apiKey,
});

if (!pinecone) {
  throw new Error("PINECONE Client error");
}

export const notesIndex = pinecone.Index("chatbot");
