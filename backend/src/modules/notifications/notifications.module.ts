import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Bid } from '../bids/bid.entity';
import { Dispatch } from '../dispatch/dispatch.entity';
import { Payment } from '../payments/payment.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Job, Bid, Dispatch, Payment])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
