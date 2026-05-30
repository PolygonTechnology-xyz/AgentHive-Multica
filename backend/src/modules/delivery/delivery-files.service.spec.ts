import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeliveryFilesService } from './delivery-files.service';
import { DeliveryFile } from './delivery-file.entity';
import { Dispatch } from '../dispatch/dispatch.entity';
import { Job } from '../jobs/job.entity';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { once } from 'events';
import { join } from 'path';

describe('DeliveryFilesService', () => {
  let service: DeliveryFilesService;
  let fileRepo: any;
  let dispatchRepo: any;
  let jobRepo: any;
  let config: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    fileRepo = {
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
      findByIds: jest.fn(),
      findOne: jest.fn(),
    };
    dispatchRepo = { findOne: jest.fn() };
    jobRepo = { findOne: jest.fn() };
    config = { get: jest.fn((key: string) => ({ fileSigningSecret: 'secret', baseUrl: 'http://api.test' })[key]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryFilesService,
        { provide: getRepositoryToken(DeliveryFile), useValue: fileRepo },
        { provide: getRepositoryToken(Dispatch), useValue: dispatchRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(DeliveryFilesService);
  });

  afterEach(() => {
    const uploadRoot = join(process.cwd(), 'uploads');
    if (existsSync(uploadRoot)) rmSync(uploadRoot, { recursive: true, force: true });
  });

  it('uploads a file for the owning freelancer', async () => {
    dispatchRepo.findOne.mockResolvedValue({ id: 'dp', freelancerId: 'owner' });

    const result = await service.upload('dp', 'owner', {
      originalname: 'report.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('pdf'),
    });

    expect(result.originalName).toBe('report.pdf');
    expect(result.sizeBytes).toBe(1024);
    expect(fileRepo.save).toHaveBeenCalledWith(expect.objectContaining({ dispatchId: 'dp', ownerId: 'owner' }));
  });

  it('rejects missing and oversized files', async () => {
    await expect(service.upload('dp', 'owner')).rejects.toThrow(BadRequestException);
    await expect(
      service.upload('dp', 'owner', {
        originalname: 'huge.bin',
        mimetype: 'application/octet-stream',
        size: 51 * 1024 * 1024,
        buffer: Buffer.alloc(1),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects upload when user does not own dispatch', async () => {
    dispatchRepo.findOne.mockResolvedValue({ id: 'dp', freelancerId: 'other' });
    await expect(
      service.upload('dp', 'owner', {
        originalname: 'a.txt',
        mimetype: 'text/plain',
        size: 1,
        buffer: Buffer.from('a'),
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('validates that delivery file ids belong to dispatch and owner', async () => {
    fileRepo.findByIds.mockResolvedValue([{ id: 'f1', dispatchId: 'dp', ownerId: 'owner' }]);
    await expect(service.assertFilesBelongToDispatch('dp', 'owner', ['f1'])).resolves.toHaveLength(1);

    fileRepo.findByIds.mockResolvedValue([{ id: 'f1', dispatchId: 'other', ownerId: 'owner' }]);
    await expect(service.assertFilesBelongToDispatch('dp', 'owner', ['f1'])).rejects.toThrow(BadRequestException);
  });

  it('creates and verifies signed urls', async () => {
    const storagePath = join(process.cwd(), 'uploads', 'deliveries', 'dp', 'file.txt');
    mkdirSync(join(process.cwd(), 'uploads', 'deliveries', 'dp'), { recursive: true });
    require('fs').writeFileSync(storagePath, 'hello');

    fileRepo.findOne.mockResolvedValue({
      id: 'f1',
      dispatchId: 'dp',
      ownerId: 'owner',
      originalName: 'file.txt',
      contentType: 'text/plain',
      storagePath,
    });

    const signed = await service.createSignedUrl('f1', 'owner');
    expect(signed.url).toContain('/files/f1?exp=');
    const parsed = new URL(signed.url);
    const streamed = await service.streamSignedFile('f1', parsed.searchParams.get('exp') ?? '', parsed.searchParams.get('sig') ?? '');
    const stream = streamed.file.getStream();
    stream.resume();
    await once(stream, 'end');
    await expect(service.streamSignedFile('f1', parsed.searchParams.get('exp') ?? '', '00')).rejects.toThrow(ForbiddenException);
  });

  it('rejects expired signed urls', async () => {
    await expect(service.streamSignedFile('f1', '1', 'abcd')).rejects.toThrow(ForbiddenException);
  });

  it('allows buyer of the job to sign a file url', async () => {
    fileRepo.findOne.mockResolvedValue({ id: 'f1', dispatchId: 'dp', ownerId: 'freelancer' });
    dispatchRepo.findOne.mockResolvedValue({ id: 'dp', jobId: 'j' });
    jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'buyer' });

    await expect(service.createSignedUrl('f1', 'buyer')).resolves.toEqual(expect.objectContaining({ url: expect.any(String) }));
  });

  it('throws not found for missing file', async () => {
    fileRepo.findOne.mockResolvedValue(null);
    await expect(service.createSignedUrl('missing', 'user')).rejects.toThrow(NotFoundException);
  });
});
