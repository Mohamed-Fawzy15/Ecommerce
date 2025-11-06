/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import multer from 'multer';
import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { StorageEnum } from '../enums';
import { fileValidation } from './multer.fileValidation';
import os from 'os';

export const multerCloud = ({
  fileTypes = fileValidation.image,
  storeType = StorageEnum.cloud,
}: {
  fileTypes?: string[];
  storeType?: StorageEnum;
}) => {
  return {
    storage:
      storeType === StorageEnum.cloud
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: os.tmpdir(),
            filename(req: Request, file: Express.Multer.File, cb) {
              cb(null, `${Date.now()}_${file.originalname}`);
            },
          }),

    fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
      if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        return cb(new BadRequestException('invalid file type'));
      }
    },
  };
};
