import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.password !== value.cPassword) {
      throw new HttpException('password not match', HttpStatus.BAD_REQUEST);
    }
    return value;
  }
}
