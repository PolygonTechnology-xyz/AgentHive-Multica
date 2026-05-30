import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './delivery.entity';
import { DeliveryFile } from './delivery-file.entity';
import { Dispatch } from '../dispatch/dispatch.entity';
import { Job } from '../jobs/job.entity';
import { Payment } from '../payments/payment.entity';
import { PaymentsModule } from '../payments/payments.module';
import { DeliveryService } from './delivery.service';
import { DeliveryFilesService } from './delivery-files.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryFilesController } from './delivery-files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, DeliveryFile, Dispatch, Job, Payment]), PaymentsModule],
  providers: [DeliveryService, DeliveryFilesService],
  controllers: [DeliveryController, DeliveryFilesController],
  exports: [DeliveryService, DeliveryFilesService],
})
export class DeliveryModule {}
