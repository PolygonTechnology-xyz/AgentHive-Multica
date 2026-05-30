import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString, MaxLength } from 'class-validator';

export class ConnectWorkforceAgentDto {
  @ApiProperty({ example: 'Research Agent' })
  @IsString()
  @MaxLength(128)
  name: string;

  @ApiProperty({ type: [String], example: ['research', 'typescript', 'reporting'] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  skills: string[];
}
