import { IsNotEmpty, IsUrl } from 'class-validator';

export class RunScraperDto {
  @IsUrl()
  @IsNotEmpty()
  url!: string;
}
