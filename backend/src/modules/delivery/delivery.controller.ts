import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { DeliveryService } from './delivery.service';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';

class SubmitDeliveryDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsArray()
  attachments?: { name: string; url: string }[];
}

class RevisionRequestDto {
  @IsString()
  reason: string;
}

@Controller('dispatch')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post(':dispatchId/deliver')
  submit(
    @Param('dispatchId') dispatchId: string,
    @CurrentUser() user: User,
    @Body() dto: SubmitDeliveryDto,
  ) {
    return this.deliveryService.submit(dispatchId, user.id, dto);
  }

  @Post(':dispatchId/deliveries/:deliveryId/request-revision')
  requestRevision(
    @Param('deliveryId') deliveryId: string,
    @CurrentUser() user: User,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.deliveryService.requestRevision(deliveryId, user.id, dto.reason);
  }

  @Post(':dispatchId/deliveries/:deliveryId/approve')
  approve(@Param('deliveryId') deliveryId: string, @CurrentUser() user: User) {
    return this.deliveryService.approve(deliveryId, user.id);
  }

  @Get(':dispatchId/deliveries')
  findByDispatch(@Param('dispatchId') dispatchId: string) {
    return this.deliveryService.findByDispatch(dispatchId);
  }
}
