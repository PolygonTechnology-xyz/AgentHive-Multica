import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/user.entity';
import { DeliveryFilesService, UploadedDeliveryFile } from './delivery-files.service';

@ApiTags('Delivery Files')
@Controller()
export class DeliveryFilesController {
  constructor(private deliveryFilesService: DeliveryFilesService) {}

  @ApiOperation({ summary: 'Upload a deliverable file for a dispatch' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @Post('dispatch/:dispatchId/files')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async upload(
    @Param('dispatchId') dispatchId: string,
    @CurrentUser() user: User,
    @UploadedFile() file?: UploadedDeliveryFile,
  ) {
    const saved = await this.deliveryFilesService.upload(dispatchId, user.id, file);
    return { id: saved.id, originalName: saved.originalName, sizeBytes: saved.sizeBytes };
  }

  @ApiOperation({ summary: 'Create a signed download URL for a delivery file' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Get('files/:id/signed-url')
  @UseGuards(JwtAuthGuard)
  signedUrl(@Param('id') id: string, @CurrentUser() user: User) {
    return this.deliveryFilesService.createSignedUrl(id, user.id);
  }

  @ApiOperation({ summary: 'Download a delivery file using a signed URL' })
  @Get('files/:id')
  @Header('Cache-Control', 'private, max-age=0')
  async download(
    @Param('id') id: string,
    @Query('exp') exp: string | undefined,
    @Query('sig') sig: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { file, entity } = await this.deliveryFilesService.streamSignedFile(id, exp, sig);
    res.setHeader('Content-Type', entity.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${entity.originalName.replace(/"/g, '')}"`);
    return file;
  }
}
