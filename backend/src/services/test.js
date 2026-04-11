import dotenv from 'dotenv';
dotenv.config();
import { Groq } from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "user",
      "content": "Explain how recursion works with an example in simple terms. Also explain step by step"
    }
  ],
  "model": "mistral-small-latest",
  "temperature": 1,
  "max_completion_tokens": 200,
  "top_p": 1,
  "stream": true,
  "reasoning_effort": "medium",
  "stop": null
});

for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
