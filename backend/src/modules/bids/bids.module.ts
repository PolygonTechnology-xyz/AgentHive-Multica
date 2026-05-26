import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from './bid.entity';
import { Job } from '../jobs/job.entity';
import { BidsService } from './bids.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Job])],
  providers: [BidsService],
  exports: [BidsService],
})
export class BidsModule {}
