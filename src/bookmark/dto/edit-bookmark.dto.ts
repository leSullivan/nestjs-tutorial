import { IsOptional, IsString } from 'class-validator';

export class EditBookmarkDto {
  @IsString()
  @IsOptional()
  readonly title?: string;

  @IsString()
  @IsOptional()
  readonly link?: string;

  @IsString()
  @IsOptional()
  readonly description?: string;
}
