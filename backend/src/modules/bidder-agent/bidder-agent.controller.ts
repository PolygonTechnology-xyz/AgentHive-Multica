import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { BearerOnlyJwtAuthGuard } from '../../common/guards/bearer-only-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { BidderAgentService } from './bidder-agent.service';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateBidderAgentDto {
  @ApiPropertyOptional({
    description: 'Natural-language config used by the scoring engine',
    example: 'Bid on React, Next.js, or TypeScript jobs above ৳5000.',
  })
  @IsOptional()
  @IsString()
  nlConfig?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  bidThreshold?: number;

  @ApiPropertyOptional({ minimum: 0, example: 20000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxBidAmount?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  autoBidEnabled?: boolean;
}

class TestScoreDto {
  @ApiProperty({ example: 'Build a landing page' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Need a Next.js landing page with hero, features, pricing.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'web-development' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String], example: ['react', 'nextjs'] })
  @IsOptional()
  skillsRequired?: string[];

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetMin?: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetMax?: number;
}

@ApiTags('Bidder Agent')
@ApiBearerAuth('JWT')
@Controller('bidder-agent')
@UseGuards(BearerOnlyJwtAuthGuard, RolesGuard)
@Roles('freelancer')
export class BidderAgentController {
  constructor(private bidderAgentService: BidderAgentService) {}

  @ApiOperation({ summary: 'Get my bidder agent (config + status)' })
  @Get('me')
  getMyAgent(@CurrentUser() user: User) {
    return this.bidderAgentService.findByUser(user.id);
  }

  @ApiOperation({ summary: 'Update agent config (NL config, threshold, auto-bid)' })
  @Patch('me')
  updateMyAgent(@CurrentUser() user: User, @Body() dto: UpdateBidderAgentDto) {
    return this.bidderAgentService.update(user.id, dto);
  }

  @ApiOperation({ summary: 'Bid history (auto and manual)' })
  @Get('me/history')
  getBidHistory(@CurrentUser() user: User) {
    return this.bidderAgentService.findBidHistory(user.id);
  }

  @ApiOperation({ summary: 'Dry-run the scoring engine on a hypothetical job' })
  @Post('me/test-score')
  testScore(@CurrentUser() user: User, @Body() dto: TestScoreDto) {
    return this.bidderAgentService.testScore(user.id, dto);
  }
}
