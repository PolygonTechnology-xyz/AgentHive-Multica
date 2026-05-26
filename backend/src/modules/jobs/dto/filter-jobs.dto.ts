import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterJobsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Free-text search on title/description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'web-development' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ minimum: 0, example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMin?: number;

  @ApiPropertyOptional({ minimum: 0, example: 20000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMax?: number;

  @ApiPropertyOptional({ description: 'Comma-separated skills', example: 'react,typescript' })
  @IsOptional()
  @IsString()
  skills?: string;
}
