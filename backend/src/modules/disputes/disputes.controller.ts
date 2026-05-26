import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@ApiTags('Disputes')
@ApiBearerAuth('JWT')
@ApiCookieAuth('access_token')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @ApiOperation({ summary: 'File a dispute against a counterparty on a job' })
  @Post()
  fileDispute(@Body() dto: CreateDisputeDto, @CurrentUser() user: User) {
    return this.disputesService.fileDispute(dto, user.id);
  }

  @ApiOperation({ summary: 'List my disputes (filed by or against me)' })
  @Get('mine')
  mine(@CurrentUser() user: User) {
    return this.disputesService.findByUser(user.id);
  }
}
