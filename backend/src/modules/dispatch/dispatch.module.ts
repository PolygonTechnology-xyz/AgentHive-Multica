import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispatch } from './dispatch.entity';
import { DispatchService } from './dispatch.service';
import { Job } from '../jobs/job.entity';
import { Bid } from '../bids/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dispatch, Job, Bid])],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
