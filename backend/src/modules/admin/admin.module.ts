import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Payment } from '../payments/payment.entity';
import { Dispute } from '../disputes/dispute.entity';
import { DisputesModule } from '../disputes/disputes.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

export const BIDDER_QUEUE = 'bidder-agent';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Job, Payment, Dispute]),
    DisputesModule,
    AuditLogModule,
    BullModule.registerQueue({ name: BIDDER_QUEUE }),
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
