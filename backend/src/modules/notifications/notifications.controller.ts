import { Controller, Get, Param, Patch, Query, Sse, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { NotificationsService, NotificationMessage } from './notifications.service';
import { Observable } from 'rxjs';

@ApiTags('Notifications')
@ApiBearerAuth('JWT')
@ApiCookieAuth('access_token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}


  @ApiOperation({ summary: 'Stream my notifications via server-sent events' })
  @Sse('stream')
  stream(@CurrentUser() user: User): Observable<NotificationMessage> {
    return this.notificationsService.streamForUser(user.id);
  }

  @ApiOperation({ summary: 'List my notifications (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.findByUser(user.id, Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Mark one notification as read' })
  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markRead(id, user.id);
  }

  @ApiOperation({ summary: 'Mark all my notifications as read' })
  @Patch('read-all')
  markAllRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllRead(user.id);
  }
}
