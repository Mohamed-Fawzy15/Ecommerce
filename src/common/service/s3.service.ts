/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectAclCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageEnum } from '../enums';
import { createReadStream } from 'node:fs';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  uploadFile = async ({
    storeType = StorageEnum.cloud,
    Bucket = process.env.AWS_BUCKET_NAME!,
    path = 'general',
    ACL = 'private' as ObjectCannedACL,
    file,
  }: {
    storeType?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
  }): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${
        file.originalname
      }`,
      Body:
        storeType === StorageEnum.cloud
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    if (!command.input.Key) {
      throw new BadRequestException('Failed to upload file');
    }

    return command.input.Key;
  };

  uploadLarageFile = async ({
    storeType = StorageEnum.cloud,
    Bucket = process.env.AWS_BUCKET_NAME!,
    path = 'general',
    ACL = 'private' as ObjectCannedACL,
    file,
  }: {
    storeType?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
  }): Promise<string> => {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${
          file.originalname
        }`,
        Body:
          storeType === StorageEnum.cloud
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });

    upload.on('httpUploadProgress', (progress) => {
      console.log(progress);
    });

    const { Key } = await upload.done();

    if (!Key) {
      throw new BadRequestException('Failed to upload file');
    }

    return Key;
  };

  uploadFiles = async ({
    storeType = StorageEnum.cloud,
    Bucket = process.env.AWS_BUCKET_NAME!,
    path = 'general',
    ACL = 'private' as ObjectCannedACL,
    files,
    useLarge = false,
  }: {
    storeType?: StorageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    files: Express.Multer.File[];
    useLarge?: boolean;
  }): Promise<string[]> => {
    let urls: string[] = [];
    // to upload one by one
    // for (const file of files) {
    //   const key = await uploadFile({
    //     path: `${process.env.APPLICATION_NAME}/${path}/coverImages/${randomUUID()}_${
    //       file.originalname
    //     }`,
    //     file,
    //   });
    //   urls.push(key);
    // }

    // to upload all files togther
    if (useLarge === true) {
      urls = await Promise.all(
        files.map((file) =>
          this.uploadLarageFile({ storeType, Bucket, ACL, path, file }),
        ),
      );
    } else {
      urls = await Promise.all(
        files.map((file) =>
          this.uploadFile({ storeType, Bucket, ACL, path, file }),
        ),
      );
    }

    return urls;
  };

  createUploadFilePresignedUrl = async ({
    originalname,
    ContentType,
    path = 'general',
    expiresIn = 60,
  }: {
    originalname: string;
    ContentType: string;
    path: string;
    expiresIn?: number;
  }) => {
    const Key = `${
      process.env.APPLICATION_NAME
    }/${path}/${randomUUID()}_${originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key,
      ContentType,
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    return { url, Key };
  };

  getFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }) => {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });

    return await this.s3Client.send(command);
  };

  createGetFilePresignedUrl = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    Key,
    expiresIn = 60,
    downloadName,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    downloadName?: string | undefined;
  }) => {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition: downloadName
        ? `attachment; filename="${downloadName || Key.split('/').pop()}"`
        : undefined,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    return url;
  };

  deleteFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }) => {
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    return await this.s3Client.send(command);
  };

  deleteFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    urls,
    Quiet = false,
  }: {
    Bucket?: string;
    urls: string[];
    Quiet: boolean;
  }) => {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: urls.map((url) => ({ Key: url })),
        Quiet,
      },
    });

    return await this.s3Client.send(command);
  };

  listFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    path,
  }: {
    Bucket?: string;
    path: string;
  }) => {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${process.env.APPLICATION_NAME}/${path}`,
    });

    return await this.s3Client.send(command);
  };
}
