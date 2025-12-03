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
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @ApiOperation({
    summary: 'Create a reel',
    description: 'Create a new reel with source URL',
  })
  @ApiBody({
    type: CreateReelDto,
    examples: {
      example1: {
        summary: 'Create reel with source',
        value: {
          description: 'My awesome reel',
          source: 'https://example.com/video.mp4',
          createdBy: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reel created successfully',
  })
  create(@Body() createReelDto: CreateReelDto) {
    return this.reelsService.create(createReelDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all reels',
    description: 'Retrieve all reels',
  })
  @ApiResponse({
    status: 200,
    description: 'Reels retrieved successfully',
  })
  findAll() {
    return this.reelsService.findAll();
  }

  @Get('user/:createdBy')
  @ApiOperation({
    summary: 'Get reels by user',
    description: 'Retrieve all reels created by a specific user',
  })
  @ApiParam({
    name: 'createdBy',
    type: 'string',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reels retrieved successfully',
  })
  findByUser(@Param('createdBy') createdBy: string) {
    return this.reelsService.findByUser(createdBy);
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get a specific reel',
    description: 'Retrieve a single reel by UUID',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Reel UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Reel retrieved successfully',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.reelsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({
    summary: 'Update a reel',
    description: 'Update reel information',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Reel UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateReelDto,
    examples: {
      example1: {
        summary: 'Update reel',
        value: {
          description: 'Updated description',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reel updated successfully',
  })
  update(@Param('uuid') uuid: string, @Body() updateReelDto: UpdateReelDto) {
    return this.reelsService.update(uuid, updateReelDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a reel',
    description: 'Remove a reel',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Reel UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Reel deleted successfully',
  })
  remove(@Param('uuid') uuid: string) {
    return this.reelsService.remove(uuid);
  }

  @Post('upload/:userId')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a reel file',
    description: 'Upload a reel video file and create a reel',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'User UUID (creator)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: CreateReelUploadDto,
    examples: {
      example1: {
        summary: 'Upload reel with file',
        value: {
          file: 'Binary file content',
          description: 'My uploaded reel',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Reel uploaded successfully',
  })
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
