import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({
    description: 'The message sent by the user',
    example: 'I have a headache and fever',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}