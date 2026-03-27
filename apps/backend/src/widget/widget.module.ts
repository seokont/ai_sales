import { Module } from '@nestjs/common';
import { WidgetController } from './widget.controller';
import { WidgetServeController } from './widget-serve.controller';
import { ChatModule } from '../chat/chat.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ChatModule, AiModule],
  controllers: [WidgetController, WidgetServeController],
})
export class WidgetModule {}
