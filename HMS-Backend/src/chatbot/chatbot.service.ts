// chatbot.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ChatbotService {
  private readonly HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/';
  private readonly MODEL_NAME = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

  constructor(private configService: ConfigService) {}

  private getApiKey(): string {
    return this.configService.get<string>('HUGGING_FACE_API_KEY');
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.getApiKey()}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(message: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(
        `${this.HUGGING_FACE_API_URL}${this.MODEL_NAME}`,
        {
          inputs: this.formatPrompt(message),
        },
        {
          headers: this.getHeaders(),
        }
      );
  
      const result = response.data;
      let responseText = '';
      if (Array.isArray(result)) {
        responseText = result[0].generated_text;
      } else if (typeof result === 'string') {
        responseText = result;
      }
  
      return {
        message: this.cleanResponse(responseText)
      };
    } catch (error) {
      console.error('Error in chatbot service:', error);
      throw new Error('Failed to get response from chatbot');
    }
  }

  async getHistory(userId: string): Promise<any[]> {
    // For now, we'll just return an empty array
    // You can implement actual history storage in your database later
    return [];
  }

  private formatPrompt(message: string): string {
    return `You are a healthcare assistant. Analyze the following symptoms and provide preliminary information about possible causes and recommendations for next steps. Be concise and professional.

User: ${message}

Assistant:`;
  }

  private cleanResponse(response: string): string {
    const cleaned = response
      .replace(/Assistant:/, '')
      .replace(/User:/, '')
      .trim();

    return cleaned;
  }
}