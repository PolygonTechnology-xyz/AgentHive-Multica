import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({ example: 8500, minimum: 1, description: 'Bid amount in BDT' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    example: 'I can deliver this in 5 days using Next.js + Tailwind. Portfolio: …',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  proposal?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  deliveryDays?: number;
}
