import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserStatus } from '../users/user.entity';
import { DisputeStatus } from '../disputes/dispute.entity';
import { ResolveDisputeDto } from '../disputes/dto/resolve-dispute.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

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

  @Patch('users/:id/status')
  setUserStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.adminService.setUserStatus(id, status);
  }

  @Get('users/:id/view')
  getUserView(@Param('id') id: string) {
    return this.adminService.getUserView(id);
  }

  @Get('jobs')
  listJobs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.listJobs(Number(page), Number(limit), status);
  }

  @Get('payments')
  listPayments(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.listPayments(Number(page), Number(limit));
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('disputes')
  listDisputes(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: DisputeStatus,
  ) {
    return this.adminService.listDisputes(Number(page), Number(limit), status);
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.resolveDispute(id, dto, admin.id);
  }
}
