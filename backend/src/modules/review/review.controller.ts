import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ReviewService } from './review.service';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateReviewDto {
  @ApiProperty({ format: 'uuid', example: '5a2c1d44-3b81-4e9f-9a12-7c8f3e2b1d04' })
  @IsUUID()
  revieweeId: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @ApiPropertyOptional({ example: 'Delivered on time and exceeded expectations.' })
  @IsOptional()
  @IsString()
  comment?: string;
}

@ApiTags('Reviews')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Leave a review on a completed job (one per job)' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Post(':jobId/reviews')
  create(
    @Param('jobId') jobId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(jobId, user.id, dto.revieweeId, dto.rating, dto.comment);
  }

  @ApiOperation({ summary: 'Get all reviews received by a user (public)' })
  @Get('/users/:userId/reviews')
  findByUser(@Param('userId') userId: string) {
    return this.reviewService.findByUser(userId);
  }
}
