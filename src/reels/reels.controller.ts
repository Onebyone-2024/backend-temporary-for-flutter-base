import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ReelsService } from './reels.service';
import { CreateReelDto } from './dto/create-reel.dto';
import { UpdateReelDto } from './dto/update-reel.dto';
import { CreateReelUploadDto } from './dto/create-reel-upload.dto';

@Controller('reels')
@ApiTags('Reels')
export class ReelsController {
  constructor(private readonly reelsService: ReelsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReelDto: CreateReelDto) {
    return this.reelsService.create(createReelDto);
  }

  @Get()
  findAll() {
    return this.reelsService.findAll();
  }

  @Get('user/:createdBy')
  findByUser(@Param('createdBy') createdBy: string) {
    return this.reelsService.findByUser(createdBy);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.reelsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() updateReelDto: UpdateReelDto) {
    return this.reelsService.update(uuid, updateReelDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.reelsService.remove(uuid);
  }

  @Post('upload/:userId')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadReel(
    @Param('userId') userId: string,
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    @Body() body: CreateReelUploadDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.reelsService.uploadReel(file, userId, body.description);
  }
}
