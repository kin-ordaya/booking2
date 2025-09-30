import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
@Controller('usuario')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Post('upload_excel')
  @Roles('ADMINISTRADOR')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: any) {
    if (!file) throw new Error('No se pudo subir el archivo');
    try {
      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[1];
      const sheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const usuarios: any = XLSX.utils.sheet_to_json(sheet);

      // Insertar instituciones
      const result = await this.usuarioService.uploadExcel(usuarios);

      return {
        mensaje: `Procesados ${result.exitos} registros exitosamente.`,
        errores: result.errores,
      };
    } catch (error) {
      console.error('Error al procesar el archivo Excel', error);
      throw new HttpException(
        'Hubo un error al procesar el archivo Excel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @Roles('ADMINISTRADOR')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usuarioService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
