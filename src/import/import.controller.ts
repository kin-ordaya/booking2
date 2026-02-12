import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ImportService } from './import.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryImportDto } from './dto/query-import.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/guard/auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';
import { LogRequest } from '@/common/decorators/log-request.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('import')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('excel')
  @LogRequest()
  @Roles('ADMINISTRADOR')
  @ApiOperation({
    summary: 'Importar datos',
    description: 'Importar datos del sistema.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: any,
    @Query() queryImportDto: QueryImportDto,
  ) {
    const resultado = await this.importService.procesarExcel(
      file.buffer,
      queryImportDto,
    );
    return {
      success: true,
      data: resultado,
    };
  }
}
