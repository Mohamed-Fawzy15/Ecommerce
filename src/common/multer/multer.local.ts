/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import multer from 'multer';
import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export const multerLocal = ({ fileTypes = [] }: { fileTypes?: string[] }) => {
  return {
    storage: multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, './uploads');
      },
      filename: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, Date.now() + '__' + file.originalname);
      },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
      if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('invalid file type'));
      }
    },
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
  };
};
