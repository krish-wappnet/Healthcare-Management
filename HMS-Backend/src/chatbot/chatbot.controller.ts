import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a message to the healthcare chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Chatbot response',
    schema: {
      example: {
        message: 'You might have a viral infection. Please consult a doctor for proper diagnosis.'
      }
    }
  })
  async sendMessage(@Body() body: ChatMessageDto) {
    return this.chatbotService.sendMessage(body.message);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get chat history for a user' })
  @ApiResponse({
    status: 200,
    description: 'Chat history',
    schema: {
      example: [
        {
          id: '1',
          text: 'I have a headache and fever',
          sender: 'user',
          timestamp: '2025-05-02T13:41:51+05:30'
        },
        {
          id: '2',
          text: 'You might have a viral infection. Please consult a doctor for proper diagnosis.',
          sender: 'bot',
          timestamp: '2025-05-02T13:41:51+05:30'
        }
      ]
    }
  })
  async getHistory(@Param('userId') userId: string) {
    return this.chatbotService.getHistory(userId);
  }
}