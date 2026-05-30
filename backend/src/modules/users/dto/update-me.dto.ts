import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Matches, MaxLength, ArrayMaxSize } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Jane Freelancer' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiPropertyOptional({ example: 'Automation specialist for research and reporting.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @ApiPropertyOptional({ example: 'jane-freelancer' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'handle must be slug-like: lowercase letters, numbers, and single hyphens',
  })
  handle?: string;

  @ApiPropertyOptional({ type: [String], example: ['typescript', 'nestjs'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  skills?: string[];
}
