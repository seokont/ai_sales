import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [ContactController],
})
export class ContactModule {}
