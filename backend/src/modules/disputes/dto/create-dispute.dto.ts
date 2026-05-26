import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisputeDto {
  @ApiProperty({ example: 'a3e8b2c4-1d44-4f9a-b811-7e2c5f6a0d12', format: 'uuid' })
  @IsUUID()
  jobId: string;

  @ApiProperty({
    example: 'Freelancer never delivered after 2 weeks past deadline despite multiple follow-ups.',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  reason: string;
}
