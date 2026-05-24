import OpenAI from 'openai';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';

let client = null;

const getClient = () => {
  if (!client && env.openaiApiKey) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
};

export const openaiProvider = {
  async complete(prompt, options = {}) {
    const openai = getClient();
    if (!openai) {
      logger.warn('OpenAI not configured, using fallback');
      return null;
    }

    try {
      const response = await openai.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: options.system || 'You are a helpful recruitment AI assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        response_format: options.json ? { type: 'json_object' } : undefined,
      });

      return response.choices[0]?.message?.content;
    } catch (err) {
      logger.error(`OpenAI request failed: ${err.message}`);
      return null;
    }
  },
};
