import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { BidderAgentService } from './bidder-agent.service';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateBidderAgentDto {
  @IsOptional()
  @IsString()
  nlConfig?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  bidThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxBidAmount?: number;

  @IsOptional()
  @IsBoolean()
  autoBidEnabled?: boolean;
}

class TestScoreDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  skillsRequired?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetMax?: number;
}

@Controller('bidder-agent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('freelancer')
export class BidderAgentController {
  constructor(private bidderAgentService: BidderAgentService) {}

  @Get('me')
  getMyAgent(@CurrentUser() user: User) {
    return this.bidderAgentService.findByUser(user.id);
  }

  @Patch('me')
  updateMyAgent(@CurrentUser() user: User, @Body() dto: UpdateBidderAgentDto) {
    return this.bidderAgentService.update(user.id, dto);
  }

  @Get('me/history')
  getBidHistory(@CurrentUser() user: User) {
    return this.bidderAgentService.findBidHistory(user.id);
  }

  @Post('me/test-score')
  testScore(@CurrentUser() user: User, @Body() dto: TestScoreDto) {
    return this.bidderAgentService.testScore(user.id, dto);
  }
}
