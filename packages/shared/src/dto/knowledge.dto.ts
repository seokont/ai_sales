import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsObject()
  jsonData?: Record<string, unknown>;
}

export class UpdateKnowledgeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  jsonData?: Record<string, unknown>;
}
