import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { BearerOnlyJwtAuthGuard } from '../../common/guards/bearer-only-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/user.entity';
import { ConnectWorkforceAgentDto } from './dto/connect-workforce-agent.dto';
import { WorkforceAgentsService } from './workforce-agents.service';

@ApiTags('Workforce Agents')
@ApiBearerAuth('JWT')
@Controller('workforce-agents')
@UseGuards(BearerOnlyJwtAuthGuard, RolesGuard)
export class WorkforceAgentsController {
  constructor(private workforceAgentsService: WorkforceAgentsService) {}

  @ApiOperation({ summary: 'Register a Workforce Agent' })
  @Post()
  @Roles('freelancer')
  create(@CurrentUser() user: User, @Body() dto: ConnectWorkforceAgentDto) {
    return this.workforceAgentsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'List current user Workforce Agents' })
  @Get()
  list(@CurrentUser() user: User) {
    return this.workforceAgentsService.listForUser(user.id);
  }

  @ApiOperation({ summary: 'Deactivate a Workforce Agent' })
  @Patch(':id/deactivate')
  deactivate(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workforceAgentsService.deactivate(user.id, id);
  }

  @ApiOperation({ summary: 'Soft-remove a Workforce Agent' })
  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workforceAgentsService.remove(user.id, id);
  }
}
