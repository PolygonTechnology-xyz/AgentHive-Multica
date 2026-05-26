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

@Controller('jobs')
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private bidsService: BidsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.id, dto);
  }

  @Get()
  findAll(@Query() filter: FilterJobsDto) {
    return this.jobsService.findAll(filter);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  findMine(@CurrentUser() user: User) {
    return this.jobsService.findByBuyer(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.jobsService.cancel(id, user.id);
  }

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

  @Get(':id/bids')
  @UseGuards(JwtAuthGuard)
  getBids(@Param('id') jobId: string, @CurrentUser() user: User) {
    return this.bidsService.findByJob(jobId, user.id, user.role);
  }

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
