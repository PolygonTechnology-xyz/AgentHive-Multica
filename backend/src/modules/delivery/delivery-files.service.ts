import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DeliveryFile } from './delivery-file.entity';
import { Dispatch } from '../dispatch/dispatch.entity';
import { Job } from '../jobs/job.entity';

export type UploadedDeliveryFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type SignedDeliveryFileUrl = {
  url: string;
  expiresAt: string;
};

@Injectable()
export class DeliveryFilesService {
  private readonly maxFileSizeBytes = 50 * 1024 * 1024;

  constructor(
    @InjectRepository(DeliveryFile) private fileRepo: Repository<DeliveryFile>,
    @InjectRepository(Dispatch) private dispatchRepo: Repository<Dispatch>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    private config: ConfigService,
  ) {}

  async upload(dispatchId: string, ownerId: string, file?: UploadedDeliveryFile): Promise<DeliveryFile> {
    if (!file) throw new BadRequestException('File is required');
    if (file.size > this.maxFileSizeBytes) throw new BadRequestException('File exceeds 50 MB limit');

    const dispatch = await this.dispatchRepo.findOne({ where: { id: dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.freelancerId !== ownerId) throw new ForbiddenException();

    const id = uuidv4();
    const extension = extname(file.originalname).slice(0, 20);
    const directory = join(process.cwd(), 'uploads', 'deliveries', dispatchId);
    mkdirSync(directory, { recursive: true });

    const storagePath = join(directory, `${id}${extension}`);
    writeFileSync(storagePath, file.buffer);

    return this.fileRepo.save(
      this.fileRepo.create({
        id,
        dispatchId,
        ownerId,
        originalName: file.originalname,
        contentType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size,
        storagePath,
      }),
    );
  }

  async assertFilesBelongToDispatch(
    dispatchId: string,
    ownerId: string,
    fileIds?: string[],
  ): Promise<DeliveryFile[]> {
    if (!fileIds?.length) return [];

    const uniqueIds = [...new Set(fileIds)];
    const files = await this.fileRepo.findByIds(uniqueIds);
    const allowed = files.filter((file) => file.dispatchId === dispatchId && file.ownerId === ownerId);
    if (allowed.length !== uniqueIds.length) {
      throw new BadRequestException('One or more delivery files are invalid for this dispatch');
    }
    return allowed;
  }

  async createSignedUrl(fileId: string, userId: string): Promise<SignedDeliveryFileUrl> {
    const file = await this.findAccessibleFile(fileId, userId);
    const expiresAtMs = Date.now() + 60 * 60 * 1000;
    const exp = Math.floor(expiresAtMs / 1000);
    const sig = this.sign(file.id, exp);
    const baseUrl = this.config.get<string>('baseUrl') ?? this.config.get<string>('apiBaseUrl') ?? this.localApiBaseUrl();

    return {
      url: `${baseUrl}/files/${file.id}?exp=${exp}&sig=${sig}`,
      expiresAt: new Date(expiresAtMs).toISOString(),
    };
  }

  async appendSignedUrls<T extends { attachments?: Array<{ fileId: string }> }>(
    deliveries: T[],
    userId: string,
  ): Promise<Array<T & { attachments: Array<Record<string, unknown>> }>> {
    return Promise.all(
      deliveries.map(async (delivery) => {
        const attachments = await Promise.all(
          (delivery.attachments ?? []).map(async (attachment) => {
            const signed = await this.createSignedUrl(attachment.fileId, userId);
            return { ...attachment, downloadUrl: signed.url, expiresAt: signed.expiresAt };
          }),
        );
        return { ...delivery, attachments };
      }),
    );
  }

  async streamSignedFile(fileId: string, exp?: string, sig?: string): Promise<{ file: StreamableFile; entity: DeliveryFile }> {
    const expiresAt = Number(exp);
    if (!exp || !sig || !Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
      throw new ForbiddenException('Invalid or expired signature');
    }

    if (!this.verify(fileId, expiresAt, sig)) {
      throw new ForbiddenException('Invalid or expired signature');
    }

    const entity = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!entity) throw new NotFoundException('File not found');
    if (!existsSync(entity.storagePath)) throw new NotFoundException('File not found');

    return { file: new StreamableFile(createReadStream(entity.storagePath)), entity };
  }

  private async findAccessibleFile(fileId: string, userId: string): Promise<DeliveryFile> {
    const file = await this.fileRepo.findOne({ where: { id: fileId } });
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId === userId) return file;

    const dispatch = await this.dispatchRepo.findOne({ where: { id: file.dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const job = await this.jobRepo.findOne({ where: { id: dispatch.jobId } });
    if (job?.buyerId !== userId) throw new ForbiddenException();
    return file;
  }

  private sign(fileId: string, exp: number): string {
    return createHmac('sha256', this.signingSecret()).update(`${fileId}|${exp}`).digest('hex');
  }

  private verify(fileId: string, exp: number, sig: string): boolean {
    const expected = Buffer.from(this.sign(fileId, exp), 'hex');
    const actual = Buffer.from(sig, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private signingSecret(): string {
    const secret = this.config.get<string>('fileSigningSecret');
    if (!secret) throw new Error('FILE_SIGNING_SECRET is required');
    return secret;
  }

  private localApiBaseUrl(): string {
    const port = this.config.get<number>('port') ?? 3001;
    const prefix = this.config.get<string>('apiPrefix') ?? 'api/v1';
    return `http://localhost:${port}/${prefix}`;
  }
}
