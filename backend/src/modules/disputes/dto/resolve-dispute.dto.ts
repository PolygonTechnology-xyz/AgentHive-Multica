import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ResolutionOutcome {
  BUYER = 'buyer',
  FREELANCER = 'freelancer',
  PARTIAL = 'partial',
}

export class ResolveDisputeDto {
  @ApiProperty({ enum: ResolutionOutcome, example: ResolutionOutcome.BUYER })
  @IsEnum(ResolutionOutcome)
  outcome: ResolutionOutcome;

  @ApiProperty({ example: 'Refunded buyer in full due to non-delivery.' })
  @IsString()
  resolution: string;

  @ApiPropertyOptional({
    description: 'Percent refunded to buyer when outcome=partial (0-100)',
    minimum: 0,
    maximum: 100,
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  buyerRefundPercent?: number;
}
