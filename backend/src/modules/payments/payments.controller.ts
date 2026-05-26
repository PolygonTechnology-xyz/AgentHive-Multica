import { Body, Controller, Get, Param, Post, UseGuards, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { PaymentsService } from './payments.service';
import { IsOptional, IsString, IsUUID } from 'class-validator';

class FundEscrowDto {
  @IsUUID()
  jobId: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('history')
  history(@CurrentUser() user: User) {
    return this.paymentsService.findByUser(user.id);
  }

  @Post('fund-escrow')
  fundEscrow(@CurrentUser() user: User, @Body() dto: FundEscrowDto) {
    return this.paymentsService.fundEscrow(user.id, dto.jobId, dto.idempotencyKey);
  }

  @Post(':id/release')
  release(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentsService.release(id, user.id);
  }

  @Post(':id/refund')
  refund(@CurrentUser() user: User, @Param('id') id: string) {
    return this.paymentsService.refund(id, user.id);
  }
}
