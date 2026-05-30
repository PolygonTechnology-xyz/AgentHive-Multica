import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';

interface UploadedProfilePhoto {
  mimetype: string;
  size: number;
  originalname: string;
  filename: string;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_MIMES = new Set(['image/jpeg', 'image/png']);

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return this.usersService.sanitize(user);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @ApiOperation({ summary: 'Upload current user profile photo' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @Post('me/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PHOTO_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_PHOTO_MIMES.has(file.mimetype)) {
          cb(new BadRequestException('Only JPEG and PNG profile photos are allowed'), false);
          return;
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const request = req as { user?: User };
          const userId = request.user?.id;
          if (!userId) {
            cb(new BadRequestException('Authenticated user is required'), '');
            return;
          }
          const destination = join(process.cwd(), 'uploads', userId);
          mkdirSync(destination, { recursive: true });
          cb(null, destination);
        },
        filename: (_req, file, cb) => {
          const extension = file.mimetype === 'image/png' ? '.png' : extname(file.originalname) || '.jpg';
          cb(null, `${uuidv4()}${extension}`);
        },
      }),
    }),
  )
  uploadPhoto(@CurrentUser() user: User, @UploadedFile() file?: UploadedProfilePhoto) {
    if (!file) throw new BadRequestException('Profile photo is required');
    if (!ALLOWED_PHOTO_MIMES.has(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG profile photos are allowed');
    }
    if (file.size > MAX_PHOTO_BYTES) throw new BadRequestException('Profile photo must be 5 MB or smaller');
    return this.usersService.updatePhoto(user.id, `/uploads/${user.id}/${file.filename}`);
  }

  @ApiOperation({ summary: 'Get public profile by handle' })
  @Get('by-handle/:handle')
  getByHandle(@Param('handle') handle: string) {
    return this.usersService.getPublicProfileByHandle(handle);
  }
}
