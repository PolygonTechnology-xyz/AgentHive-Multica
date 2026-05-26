import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @Post()
  fileDispute(@Body() dto: CreateDisputeDto, @CurrentUser() user: User) {
    return this.disputesService.fileDispute(dto, user.id);
  }

  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.disputesService.findByUser(user.id);
  }
}
