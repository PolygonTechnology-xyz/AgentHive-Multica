import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Payment } from '../payments/payment.entity';
import { Dispute } from '../disputes/dispute.entity';
import { DisputesModule } from '../disputes/disputes.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Job, Payment, Dispute]), DisputesModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
