import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { CreateReelDto } from './dto/create-reel.dto';
import { UpdateReelDto } from './dto/update-reel.dto';

@Injectable()
export class ReelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async create(createReelDto: CreateReelDto) {
    const { createdBy } = createReelDto;
    const client = this.prisma.getPrisma();

    // Check if user exists
    const user = await client.user.findUnique({ where: { uuid: createdBy } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await client.reel.create({
      data: createReelDto,
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.reel.findMany({
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const reel = await client.reel.findUnique({
      where: { uuid },
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
    });

    if (!reel) {
      throw new NotFoundException(`Reel with UUID ${uuid} not found`);
    }

    return reel;
  }

  async findByUser(createdBy: string) {
    const client = this.prisma.getPrisma();

    const user = await client.user.findUnique({ where: { uuid: createdBy } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await client.reel.findMany({
      where: { createdBy },
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(uuid: string, updateReelDto: UpdateReelDto) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    return await client.reel.update({
      where: { uuid },
      data: updateReelDto,
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    await client.reel.delete({
      where: { uuid },
    });
  }

  async uploadReel(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    userId: string,
    description?: string,
  ) {
    const client = this.prisma.getPrisma();

    // Check if user exists
    const user = await client.user.findUnique({ where: { uuid: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upload file to Google Drive
    const uploadResult = await this.googleDriveService.uploadFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Save reel record in database
    return await client.reel.create({
      data: {
        description: description || '',
        source: uploadResult.publicUrl,
        previewUrl: uploadResult.previewUrl,
        downloadUrl: uploadResult.downloadUrl,
        googleDriveFileId: uploadResult.fileId,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        fileName: uploadResult.fileName,
        createdBy: userId,
      },
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }
}
