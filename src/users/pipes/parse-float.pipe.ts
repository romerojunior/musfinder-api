import { BadRequestException, PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseFloatPipe implements PipeTransform<string> {
  async transform(value: any, metatype: ArgumentMetadata): Promise<number> {
    const isNumeric =
      'string' === typeof value &&
      !isNaN(parseFloat(value)) &&
      isFinite(value as any);
    if (!isNumeric) {
      throw new BadRequestException(
        'Validation failed (numeric string is expected)',
      );
    }
    return parseFloat(value);
  }
}