import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BIDDER_QUEUE } from '../bidder-agent/bidder-agent.service';
import { WorkforceAgent } from './workforce-agent.entity';
import { WorkforceAgentsController } from './workforce-agents.controller';
import { WorkforceAgentsService } from './workforce-agents.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkforceAgent]), BullModule.registerQueue({ name: BIDDER_QUEUE })],
  controllers: [WorkforceAgentsController],
  providers: [WorkforceAgentsService],
  exports: [WorkforceAgentsService, TypeOrmModule],
})
export class WorkforceAgentsModule {}
