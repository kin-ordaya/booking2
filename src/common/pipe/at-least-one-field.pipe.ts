import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class AtLeastOneFieldPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (Object.keys(value).length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un campo para actualizar');
    }
    return value;
  }
}