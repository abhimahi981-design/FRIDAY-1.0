import { WebSocketServer } from 'ws';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const wss = new WebSocketServer({ port: 8080 });
const openai = new OpenAI({ apiKey: process.env.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 });

console.log("FRIDAY Voice Protocol server running on ws://localhost:8080");

wss.on('connection', (ws) => {
  console.log("Client connected");

  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    if (data.type === 'USER_PROMPT') {
      try {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are FRIDAY. Reply concisely in 1-2 sharp sentences.' },
            { role: 'user', content: data.text }
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            // Stream text tokens immediately as they are generated
            ws.send(JSON.stringify({ type: 'AUDIO_CHUNK', text: content }));
          }
        }

        ws.send(JSON.stringify({ type: 'STREAM_END' }));
      } catch (err) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Stream interrupted' }));
      }
    }
  });
});

