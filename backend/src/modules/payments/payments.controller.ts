import { Body, Controller, Get, Param, Post, UseGuards, Headers } from '@nestjs/common';
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
import { PaymentsService } from './payments.service';
import { IsOptional, IsString, IsUUID } from 'class-validator';

class FundEscrowDto {
  @ApiProperty({ format: 'uuid', example: 'a3e8b2c4-1d44-4f9a-b811-7e2c5f6a0d12' })
  @IsUUID()
  jobId: string;

  @ApiPropertyOptional({
    description: 'Client-generated key to dedupe retries',
    example: 'fund-2026-05-26-001',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

@ApiTags('Payments')
@ApiBearerAuth('JWT')
@ApiCookieAuth('access_token')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Get my payment history (buyer or freelancer view)' })
  @Get('history')
  history(@CurrentUser() user: User) {
    return this.paymentsService.findByUser(user.id);
  }

  @ApiOperation({
    summary: 'Fund escrow for an accepted bid',
    description:
      'Uses configured PAYMENT_GATEWAY (mock|ppay). Returns gateway URL/status. Idempotent via idempotencyKey.',
  })
  @Post('fund-escrow')
  fundEscrow(@CurrentUser() user: User, @Body() dto: FundEscrowDto) {
    return this.paymentsService.fundEscrow(user.id, dto.jobId, dto.idempotencyKey);
  }

  @ApiOperation({ summary: 'Release escrow to freelancer (buyer only, on delivery approval)' })
  @Post(':id/release')
  release(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentsService.release(id, user.id);
  }

  @ApiOperation({ summary: 'Refund escrow to buyer (admin or dispute resolution flow)' })
  @Post(':id/refund')
  refund(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentsService.refund(id, user.id);
  }
}
