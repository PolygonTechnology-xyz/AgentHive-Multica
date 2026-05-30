import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
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
    example: 'fund-2026-05-29-001',
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


  @ApiOperation({ summary: 'Get freelancer payout history and balances' })
  @Get('freelancer')
  @UseGuards(RolesGuard)
  @Roles('freelancer')
  freelancerPayouts(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.paymentsService.findFreelancerPayouts(user.id, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Get my payment history (buyer or freelancer view)' })
  @Get('history')
  history(@CurrentUser() user: User) {
    return this.paymentsService.findByUser(user.id);
  }

  @ApiOperation({
    summary: 'Initiate Ppay escrow checkout — returns redirectUrl',
    description:
      'Creates a PENDING payment and returns the Ppay-hosted checkout URL. ' +
      'The buyer browser must be redirected to that URL. Confirmation is asynchronous via Ppay IPN webhook.',
  })
  @Post('fund-escrow')
  async fundEscrow(@CurrentUser() user: User, @Body() dto: FundEscrowDto) {
    const { payment, redirectUrl } = await this.paymentsService.fundEscrow(
      user.id,
      dto.jobId,
      dto.idempotencyKey,
    );
    return { paymentId: payment.id, ppayReference: payment.ppayReference, redirectUrl };
  }

  @ApiOperation({
    summary: 'Force a Ppay status query and reconcile (use if IPN never arrived)',
  })
  @Post(':id/reconcile')
  reconcile(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentsService.queryAndReconcile(id);
  }

  @ApiOperation({ summary: 'Release escrow to freelancer (buyer only, on delivery approval)' })
  @Post(':id/release')
  release(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentsService.release(id, user.id);
  }

  @ApiOperation({ summary: 'Refund escrow to buyer (Ppay refund flow)' })
  @Post(':id/refund')
  refund(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentsService.refund(id, user.id);
  }
}
