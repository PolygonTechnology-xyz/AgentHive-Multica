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
import { DeliveryService } from './delivery.service';
import { ArrayUnique, IsArray, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

class SubmitDeliveryDto {
  @ApiPropertyOptional({ example: 'Initial delivery. See attached zip.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ type: [String], example: ['0b0d79ed-67fb-4999-9608-32a8c5df47b1'] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  fileIds?: string[];
}

class RevisionRequestDto {
  @ApiProperty({ example: 'Hero section copy needs to mention the AI matching feature.' })
  @IsString()
  @MinLength(10, { message: 'Revision reason must be at least 10 characters' })
  @MaxLength(2000)
  reason: string;
}

@ApiTags('Dispatch & Delivery')
@ApiBearerAuth('JWT')
@ApiCookieAuth('access_token')
@Controller()
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @ApiOperation({ summary: 'Submit a delivery (freelancer)' })
  @Post('dispatch/:dispatchId/deliver')
  submit(
    @Param('dispatchId') dispatchId: string,
    @CurrentUser() user: User,
    @Body() dto: SubmitDeliveryDto,
  ) {
    return this.deliveryService.submit(dispatchId, user.id, dto);
  }

  @ApiOperation({ summary: 'Request a revision on a delivery (buyer)' })
  @Post('dispatch/:dispatchId/deliveries/:deliveryId/request-revision')
  requestRevision(
    @Param('deliveryId') deliveryId: string,
    @CurrentUser() user: User,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.deliveryService.requestRevision(deliveryId, user.id, dto.reason);
  }

  @ApiOperation({ summary: 'Request a revision on a delivery (buyer)' })
  @Post('deliveries/:deliveryId/request-revision')
  requestRevisionByDelivery(
    @Param('deliveryId') deliveryId: string,
    @CurrentUser() user: User,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.deliveryService.requestRevision(deliveryId, user.id, dto.reason);
  }

  @ApiOperation({ summary: 'Approve a delivery (buyer) — triggers escrow release' })
  @Post('dispatch/:dispatchId/deliveries/:deliveryId/approve')
  approve(@Param('deliveryId') deliveryId: string, @CurrentUser() user: User) {
    return this.deliveryService.approve(deliveryId, user.id);
  }

  @ApiOperation({ summary: 'Approve a delivery (buyer) — triggers escrow release' })
  @Post('deliveries/:deliveryId/approve')
  approveByDelivery(@Param('deliveryId') deliveryId: string, @CurrentUser() user: User) {
    return this.deliveryService.approve(deliveryId, user.id);
  }

  @ApiOperation({ summary: 'List all deliveries (incl. revision rounds) for a dispatch' })
  @Get('dispatch/:dispatchId/deliveries')
  findByDispatch(@Param('dispatchId') dispatchId: string) {
    return this.deliveryService.findByDispatch(dispatchId);
  }

  @ApiOperation({ summary: 'List all deliveries for a job' })
  @Get('jobs/:jobId/deliveries')
  findByJob(@Param('jobId') jobId: string, @CurrentUser() user: User) {
    return this.deliveryService.findByJob(jobId, user.id);
  }
}

export { RevisionRequestDto, SubmitDeliveryDto };
