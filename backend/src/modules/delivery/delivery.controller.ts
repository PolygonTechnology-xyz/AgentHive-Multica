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
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';

class SubmitDeliveryDto {
  @ApiPropertyOptional({ example: 'Initial delivery. See attached zip.' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'object', properties: { name: { type: 'string' }, url: { type: 'string' } } },
    example: [{ name: 'design.zip', url: 'https://cdn.example.com/d/design.zip' }],
  })
  @IsOptional()
  @IsArray()
  attachments?: { name: string; url: string }[];
}

class RevisionRequestDto {
  @ApiProperty({ example: 'Hero section copy needs to mention the AI matching feature.' })
  @IsString()
  reason: string;
}

@ApiTags('Dispatch & Delivery')
@ApiBearerAuth('JWT')
@ApiCookieAuth('access_token')
@Controller('dispatch')
@UseGuards(JwtAuthGuard)
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @ApiOperation({ summary: 'Submit a delivery (freelancer)' })
  @Post(':dispatchId/deliver')
  submit(
    @Param('dispatchId') dispatchId: string,
    @CurrentUser() user: User,
    @Body() dto: SubmitDeliveryDto,
  ) {
    return this.deliveryService.submit(dispatchId, user.id, dto);
  }

  @ApiOperation({ summary: 'Request a revision on a delivery (buyer)' })
  @Post(':dispatchId/deliveries/:deliveryId/request-revision')
  requestRevision(
    @Param('deliveryId') deliveryId: string,
    @CurrentUser() user: User,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.deliveryService.requestRevision(deliveryId, user.id, dto.reason);
  }

  @ApiOperation({ summary: 'Approve a delivery (buyer) — triggers escrow release' })
  @Post(':dispatchId/deliveries/:deliveryId/approve')
  approve(@Param('deliveryId') deliveryId: string, @CurrentUser() user: User) {
    return this.deliveryService.approve(deliveryId, user.id);
  }

  @ApiOperation({ summary: 'List all deliveries (incl. revision rounds) for a dispatch' })
  @Get(':dispatchId/deliveries')
  findByDispatch(@Param('dispatchId') dispatchId: string) {
    return this.deliveryService.findByDispatch(dispatchId);
  }
}
