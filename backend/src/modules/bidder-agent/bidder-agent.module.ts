import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BidderAgent } from './bidder-agent.entity';
import { BidderAgentService, BIDDER_QUEUE } from './bidder-agent.service';
import { BidderAgentController } from './bidder-agent.controller';
import { BidderAgentProcessor } from './bidder-agent.processor';
import { ScoringService } from './scoring.service';
import { BidsModule } from '../bids/bids.module';
import { Job } from '../jobs/job.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BidderAgent, Job]),
    BullModule.registerQueue({ name: BIDDER_QUEUE }),
    BidsModule,
  ],
  providers: [BidderAgentService, BidderAgentProcessor, ScoringService],
  controllers: [BidderAgentController],
  exports: [BidderAgentService],
})
export class BidderAgentModule {}
