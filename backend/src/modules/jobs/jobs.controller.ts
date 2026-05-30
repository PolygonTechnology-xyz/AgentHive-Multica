import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { JobsService } from './jobs.service';
import { BidsService } from '../bids/bids.service';
import { CreateJobDto } from './dto/create-job.dto';
import { FilterJobsDto } from './dto/filter-jobs.dto';
import { CreateBidDto } from '../bids/dto/create-bid.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private bidsService: BidsService,
  ) {}

  @ApiOperation({ summary: 'Create a job (buyer only)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Public job board — paginated list with filters' })
  @Get()
  findAll(@Query() filter: FilterJobsDto) {
    return this.jobsService.findAll(filter);
  }

  @ApiOperation({ summary: 'List my posted jobs (buyer)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  findMine(@CurrentUser() user: User) {
    return this.jobsService.findByBuyer(user.id);
  }


  @ApiOperation({ summary: 'List jobs awarded to the current freelancer' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Get('freelancer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer')
  findFreelancerJobs(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.jobsService.findForFreelancer(user.id, status, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Get job detail' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @ApiOperation({ summary: 'Update job (buyer, owner only)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: Partial<CreateJobDto>,
  ) {
    return this.jobsService.update(id, user.id, dto);
  }

  @ApiOperation({ summary: 'Cancel job (buyer, owner only)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.jobsService.cancel(id, user.id);
  }

  @ApiOperation({ summary: 'Place a bid on a job (freelancer only)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Post(':id/bids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer')
  createBid(
    @Param('id') jobId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.create(jobId, user.id, dto);
  }

  @ApiOperation({ summary: 'List bids on a job (job owner sees all, others see their own)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Get(':id/bids')
  @UseGuards(JwtAuthGuard)
  getBids(@Param('id') jobId: string, @CurrentUser() user: User) {
    return this.bidsService.findByJob(jobId, user.id, user.role);
  }

  @ApiOperation({ summary: 'Accept a bid (buyer only) — triggers payment escrow flow' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Patch(':id/bids/:bidId/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  acceptBid(
    @Param('id') jobId: string,
    @Param('bidId') bidId: string,
    @CurrentUser() user: User,
  ) {
    return this.bidsService.accept(jobId, bidId, user.id);
  }

  @ApiOperation({ summary: 'Reject a bid (buyer only)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Patch(':id/bids/:bidId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  rejectBid(
    @Param('id') jobId: string,
    @Param('bidId') bidId: string,
    @CurrentUser() user: User,
  ) {
    return this.bidsService.reject(jobId, bidId, user.id);
  }
}
