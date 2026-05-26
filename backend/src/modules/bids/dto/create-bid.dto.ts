import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  @MinLength(10)
  proposal?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  deliveryDays?: number;
}
