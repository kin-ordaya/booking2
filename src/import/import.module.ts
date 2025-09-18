import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { RolModule } from 'src/rol/rol.module';
import { DocumentoIdentidadModule } from 'src/documento_identidad/documento_identidad.module';

@Module({
  imports: [
    UsuarioModule,
    RolModule,
    DocumentoIdentidadModule,
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
