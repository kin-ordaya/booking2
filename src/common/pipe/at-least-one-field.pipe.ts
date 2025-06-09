import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class AtLeastOneFieldPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const hasAtLeastOneDefinedValue = Object.values(value).some(
      (val) => val !== undefined && val !== null && val !== ''
    );

    if (!hasAtLeastOneDefinedValue) {
      throw new BadRequestException('Debe proporcionar al menos un campo para actualizar');
    }
    return value;
  }
}