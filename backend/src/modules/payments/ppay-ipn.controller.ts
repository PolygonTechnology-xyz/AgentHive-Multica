import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { IsIn, IsOptional, IsString } from 'class-validator';

class IpnPayloadDto {
  @IsString()
  paymentId: string;

  @IsString()
  uniqueIdForMerchant: string;

  @IsIn(['INITIATED', 'SUCCESSFUL', 'FAILED', 'CANCELLED'])
  status: 'INITIATED' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  failReason?: string | null;
}

/**
 * Ppay IPN webhook — separate controller, no JwtAuthGuard.
 *
 * Auth: x-api-key header must match PPAY_API_SECRET (pending Ppay confirming
 * the exact signing mechanism, per spec §4). Failed validation → 401 + audit.
 *
 * Idempotency + state-transition logic lives in PaymentsService.handleIpn —
 * this controller is a thin shim.
 */
@ApiExcludeController()
@Controller('payments/ppay/ipn')
export class PpayIpnController {
  private readonly logger = new Logger(PpayIpnController.name);

  constructor(
    private readonly payments: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @HttpCode(200)
  async receive(
    @Headers('x-api-key') apiKey: string | undefined,
    @Body() body: IpnPayloadDto,
  ): Promise<{ ok: true }> {
    const expected = this.config.get<string>('ppay.apiSecret');
    if (!expected || !apiKey || apiKey !== expected) {
      this.logger.warn(`IPN rejected — invalid x-api-key for paymentId=${body?.paymentId ?? '(none)'}`);
      throw new UnauthorizedException('signature_invalid');
    }

    await this.payments.handleIpn({
      paymentId: body.paymentId,
      uniqueIdForMerchant: body.uniqueIdForMerchant,
      status: body.status,
      transactionId: body.transactionId,
      failReason: body.failReason ?? null,
    });

    return { ok: true };
  }
}
