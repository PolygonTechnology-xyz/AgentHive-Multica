import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ArrayNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { WorkforceAgentService } from './workforce-agent.service';

class RegisterWorkforceAgentDto {
  @ApiProperty({ example: 'My React Bot' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [String], example: ['react', 'nextjs', 'typescript'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];
}

@ApiTags('Workforce Agents')
@ApiBearerAuth('JWT')
@ApiCookieAuth('access_token')
@Controller('workforce-agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('freelancer')
export class WorkforceAgentController {
  constructor(private workforceAgentService: WorkforceAgentService) {}

  @ApiOperation({ summary: 'Register a workforce agent (flips Bidder Agent DORMANT→ACTIVE on first)' })
  @Post()
  register(@CurrentUser() user: User, @Body() dto: RegisterWorkforceAgentDto) {
    return this.workforceAgentService.register(user.id, {
      name: dto.name,
      capabilities: dto.capabilities ?? [],
    });
  }

  @ApiOperation({ summary: 'List connected workforce agents' })
  @Get()
  list(@CurrentUser() user: User) {
    return this.workforceAgentService.findByUser(user.id);
  }
}
