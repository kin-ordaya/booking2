import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ImportService } from './import.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File) {
    try {
      const resultado = await this.importService.procesarExcel(file.buffer);
      return {
        success: true,
        data: resultado
      }
    } catch (error) {
      throw new BadRequestException('Error al procesar el archivo');
    }
  }

}
