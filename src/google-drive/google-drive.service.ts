import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface MultipartFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class GoogleDriveService {
  private readonly projectId: string;

  private readonly clientEmail: string;

  private readonly privateKey: string;

  private readonly folderIdReels: string;

  private accessToken: string;

  private tokenExpiry: Date;

  constructor(private configService: ConfigService) {
    this.projectId = this.configService.get<string>('GOOGLE_PROJECT_ID');
    this.clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
    const keyString = this.configService.get<string>('GOOGLE_PRIVATE_KEY');
    this.privateKey = keyString?.replace(/\\n/g, '\n');
    this.folderIdReels = this.configService.get<string>(
      'GOOGLE_DRIVE_FOLDER_ID_REELS',
    );

    if (
      !this.projectId ||
      !this.clientEmail ||
      !this.privateKey ||
      !this.folderIdReels
    ) {
      throw new Error('Missing Google Drive configuration in .env');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      const expiry = now + 3600;

      const header = {
        alg: 'RS256',
        typ: 'JWT',
      };

      const payload = {
        iss: this.clientEmail,
        scope: 'https://www.googleapis.com/auth/drive',
        aud: 'https://oauth2.googleapis.com/token',
        exp: expiry,
        iat: now,
      };

      const headerEncoded = Buffer.from(JSON.stringify(header)).toString(
        'base64url',
      );
      const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString(
        'base64url',
      );
      const signatureInput = `${headerEncoded}.${payloadEncoded}`;

      const sign = crypto
        .createSign('sha256')
        .update(signatureInput)
        .sign(this.privateKey, 'base64url');

      const jwt = `${signatureInput}.${sign}`;

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      });

      const data = await response.json();

      if (!data.access_token) {
        throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get Google Drive access token: ${error.message}`,
      );
    }
  }

  async uploadFile(file: MultipartFile): Promise<{
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    publicUrl: string;
  }> {
    if (file.mimetype !== 'video/mp4') {
      throw new BadRequestException('Only MP4 videos are allowed');
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / 1024 / 1024).toFixed(2);
      throw new BadRequestException(
        `File size must be less than 5MB. Current size: ${sizeMb}MB`,
      );
    }

    try {
      const accessToken = await this.getAccessToken();

      const boundary = 'foo_bar_baz';
      const metadata = {
        name: file.originalname,
        parents: [this.folderIdReels],
      };

      const metadataStr = JSON.stringify(metadata);

      const part1 = Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      );
      const part2 = Buffer.from(metadataStr);
      const part3 = Buffer.from(
        `\r\n--${boundary}\r\nContent-Type: ${file.mimetype}\r\n\r\n`,
      );
      const part4 = file.buffer;
      const part5 = Buffer.from(`\r\n--${boundary}--\r\n`);

      const multipartBody = Buffer.concat([part1, part2, part3, part4, part5]);

      const uploadUrl =
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      });

      const data = await response.json();

      if (!data.id) {
        throw new Error(`Upload failed: ${JSON.stringify(data)}`);
      }

      await this.grantPublicPermission(data.id, accessToken);

      const publicUrl = `https://drive.google.com/uc?export=download&id=${data.id}`;

      return {
        fileId: data.id,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        publicUrl,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file to Google Drive: ${error.message}`,
      );
    }
  }

  private async grantPublicPermission(
    fileId: string,
    accessToken: string,
  ): Promise<void> {
    try {
      const permUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
      const response = await fetch(permUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'anyone',
          role: 'reader',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Permission grant failed: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.warn(
        `Warning: Failed to grant public permission: ${error.message}`,
      );
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const delUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;
      const response = await fetch(delUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Delete failed with status ${response.status}`);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete file from Google Drive: ${error.message}`,
      );
    }
  }

  async getFileInfo(fileId: string): Promise<{
    id: string;
    name: string;
    size: number;
    mimeType: string;
  }> {
    try {
      const accessToken = await this.getAccessToken();

      const infoUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,size,mimeType`;
      const response = await fetch(infoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!data.id) {
        throw new Error(`File not found: ${JSON.stringify(data)}`);
      }

      return {
        id: data.id,
        name: data.name,
        size: parseInt(data.size || '0', 10),
        mimeType: data.mimeType,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get file info from Google Drive: ${error.message}`,
      );
    }
  }
}
