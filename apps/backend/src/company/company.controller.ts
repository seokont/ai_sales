import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from '@ai-seller-widget/shared';

const AVATAR_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const AVATAR_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.companyService.findByUser(user.id);
  }

  @Get(':id/avatar')
  async getAvatar(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    const company = await this.companyService.findOne(id, user.id);
    if (!company.avatarPath) {
      return res.status(404).send('Avatar not found');
    }
    return this.companyService.serveAvatar(company.avatarPath, res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.companyService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, user.id, dto);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_SIZE },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    await this.companyService.findOne(id, user.id);
    if (!file) throw new BadRequestException('No file provided');
    if (!AVATAR_EXTENSIONS.test(file.originalname || '')) {
      throw new BadRequestException('Invalid format. Use JPG, PNG, GIF or WEBP');
    }
    const ext = (file.originalname?.match(AVATAR_EXTENSIONS)?.[1] || 'png').toLowerCase();
    return this.companyService.saveAvatar(id, file.buffer, ext);
  }
}
