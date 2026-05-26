import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserStatus } from '../users/user.entity';
import { DisputeStatus } from '../disputes/dispute.entity';
import { ResolveDisputeDto } from '../disputes/dto/resolve-dispute.dto';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth('JWT')
@ApiCookieAuth('access_token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: 'List all users with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: ['buyer', 'freelancer', 'admin'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'suspended', 'pending'] })
  @ApiQuery({ name: 'search', required: false, description: 'Email search' })
  @Get('users')
  listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(Number(page), Number(limit), role, status, search);
  }

  @ApiOperation({ summary: 'Suspend or reactivate a user' })
  @Patch('users/:id/status')
  setUserStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.setUserStatus(id, status, admin.id);
  }

  @ApiOperation({ summary: 'Full user view (profile, jobs, payments, disputes)' })
  @Get('users/:id/view')
  getUserView(@Param('id') id: string) {
    return this.adminService.getUserView(id);
  }

  @ApiOperation({ summary: 'List all jobs platform-wide' })
  @Get('jobs')
  listJobs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.listJobs(Number(page), Number(limit), status);
  }

  @ApiOperation({ summary: 'List all payment transactions' })
  @Get('payments')
  listPayments(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.listPayments(Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Platform stats (users, jobs, revenue, disputes)' })
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @ApiOperation({ summary: 'List disputes' })
  @Get('disputes')
  listDisputes(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: DisputeStatus,
  ) {
    return this.adminService.listDisputes(Number(page), Number(limit), status);
  }

  @ApiOperation({
    summary: 'Resolve a dispute',
    description: 'Outcome triggers escrow release, refund, or partial split.',
  })
  @Patch('disputes/:id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.resolveDispute(id, dto, admin.id);
  }

  @ApiOperation({ summary: 'Bull queue health: counts + last 20 failed jobs' })
  @Get('queue-health')
  getQueueHealth() {
    return this.adminService.getQueueHealth();
  }

  @ApiOperation({ summary: 'Audit log search' })
  @ApiQuery({ name: 'actorId', required: false, description: 'UUID' })
  @ApiQuery({ name: 'resourceType', required: false })
  @ApiQuery({ name: 'resourceId', required: false, description: 'UUID' })
  @ApiQuery({ name: 'since', required: false, description: 'ISO 8601 date-time' })
  @ApiQuery({ name: 'until', required: false, description: 'ISO 8601 date-time' })
  @Get('audit-logs')
  listAuditLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('actorId') actorId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('since') since?: string,
    @Query('until') until?: string,
  ) {
    return this.adminService.listAuditLogs({
      page: Number(page),
      limit: Number(limit),
      actorId,
      resourceType,
      resourceId,
      since,
      until,
    });
  }
}
