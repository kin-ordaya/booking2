import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ImportService } from './import.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryImportDto } from './dto/query-import.dto';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: any,
    @Query() queryImportDto: QueryImportDto,
  ) {
    try {
      const resultado = await this.importService.procesarExcel(file.buffer, queryImportDto);
      return {
        success: true,
        data: resultado,
      };
    } catch (error) {
      throw error;
    }
  }
}
