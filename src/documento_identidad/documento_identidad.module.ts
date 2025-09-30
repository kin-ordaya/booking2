import { Module } from '@nestjs/common';
import { DocumentoIdentidadService } from './documento_identidad.service';
import { DocumentoIdentidadController } from './documento_identidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoIdentidad } from './entities/documento_identidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoIdentidad])],
  controllers: [DocumentoIdentidadController],
  providers: [DocumentoIdentidadService],
  exports: [DocumentoIdentidadService],
})
export class DocumentoIdentidadModule {}
