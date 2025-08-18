import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class PaginationReservaDto extends PaginationDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'El campo recurso_id debe ser de tipo uuid' })
  recurso_id: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'El campo inicio debe ser de tipo fecha y en formato YYYY-MM-DDTHH:mm:ss',
    },
  )
  inicio?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'El campo inicio debe ser de tipo fecha y en formato YYYY-MM-DDTHH:mm:ss',
    },
  )
  fin?: string;

  @IsOptional()
  @IsInt({ message: 'El campo estado debe ser de tipo entero' })
  @IsIn([1, 2], {
    message: 'Ordernar por estado activo=1, inactivo=2',
  })
  @Type(() => Number)
  sort_state?: number;

  @IsOptional()
  @IsInt({ message: 'El campo orden debe ser de tipo entero' })
  @IsIn([1, 2, 3, 4], {
    message: 'Ordernar por nombre ASC=1, DESC=2, por fecha ASC=3, DESC=4',
  })
  @Type(() => Number)
  sort_order?: number;

  @IsOptional()
  @IsInt({ message: 'El campo expirado debe ser de tipo entero' })
  @IsIn([1, 2], {
    message: 'Ordernar por expirado=1, no expirado=2',
  })
  @Type(() => Number)
  sort_expired?: number;
}
