import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CompanyService } from '../company/company.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private companyService: CompanyService,
  ) {}

  @Get('company/:companyId')
  async list(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.chatService.listByCompany(companyId);
  }

  @Get('company/:companyId/:chatId')
  async getOne(
    @Param('companyId') companyId: string,
    @Param('chatId') chatId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.companyService.findOne(companyId, user.id);
    return this.chatService.getChatWithMessages(chatId, companyId);
  }
}
