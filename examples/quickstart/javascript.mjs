import { OrchestraClient } from '../../sdk/javascript/index.js';

const client = new OrchestraClient({
  baseUrl: process.env.ORCHESTRA_BASE_URL || 'http://localhost:3001',
  accessToken: process.env.ORCHESTRA_ACCESS_TOKEN,
  projectId: process.env.ORCHESTRA_PROJECT_ID,
});

const response = await client.chat.completions.create({
  model: process.env.ORCHESTRA_MODEL || 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Explain what ORCHESTRA does in one sentence.' }],
});

console.log(JSON.stringify(response, null, 2));
