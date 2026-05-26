import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ReviewService } from './review.service';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateReviewDto {
  @IsUUID()
  revieweeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post(':jobId/reviews')
  create(
    @Param('jobId') jobId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(jobId, user.id, dto.revieweeId, dto.rating, dto.comment);
  }

  @Get('/users/:userId/reviews')
  findByUser(@Param('userId') userId: string) {
    return this.reviewService.findByUser(userId);
  }
}
