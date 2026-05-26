import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MockPaymentAdapter } from './adapters/mock-payment.adapter';
import { PpayAdapter } from './adapters/ppay.adapter';
import { PAYMENT_GATEWAY_TOKEN } from './adapters/payment-gateway.interface';
import { Job } from '../jobs/job.entity';
import { Bid } from '../bids/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Job, Bid])],
  providers: [
    PaymentsService,
    MockPaymentAdapter,
    PpayAdapter,
    {
      provide: PAYMENT_GATEWAY_TOKEN,
      inject: [ConfigService, MockPaymentAdapter, PpayAdapter],
      useFactory: (config: ConfigService, mock: MockPaymentAdapter, ppay: PpayAdapter) => {
        return config.get<string>('payment.gateway') === 'ppay' ? ppay : mock;
      },
    },
  ],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
