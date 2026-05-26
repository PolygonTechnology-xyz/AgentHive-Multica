import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @IsUUID()
  jobId: string;

  @IsString()
  @MinLength(20)
  reason: string;
}
