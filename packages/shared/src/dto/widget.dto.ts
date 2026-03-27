import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WidgetMessageDto {
  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsString()
  chatId?: string;
}
