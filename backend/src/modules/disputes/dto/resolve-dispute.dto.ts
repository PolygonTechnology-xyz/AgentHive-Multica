import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum ResolutionOutcome {
  BUYER = 'buyer',
  FREELANCER = 'freelancer',
  PARTIAL = 'partial',
}

export class ResolveDisputeDto {
  @IsEnum(ResolutionOutcome)
  outcome: ResolutionOutcome;

  @IsString()
  resolution: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  buyerRefundPercent?: number;
}
