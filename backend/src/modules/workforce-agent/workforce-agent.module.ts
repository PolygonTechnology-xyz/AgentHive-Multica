import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkforceAgent } from './workforce-agent.entity';
import { WorkforceAgentService } from './workforce-agent.service';
import { WorkforceAgentController } from './workforce-agent.controller';
import { BidderAgent } from '../bidder-agent/bidder-agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkforceAgent, BidderAgent])],
  providers: [WorkforceAgentService],
  controllers: [WorkforceAgentController],
  exports: [WorkforceAgentService],
})
export class WorkforceAgentModule {}
