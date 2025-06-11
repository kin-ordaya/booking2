import { Module } from '@nestjs/common';
import { ResponsableService } from './responsable.service';
import { ResponsableController } from './responsable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Responsable } from './entities/responsable.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { Campus } from 'src/campus/entities/campus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Responsable, RolUsuario, Recurso, Clase, CursoModalidad, Campus])],
  controllers: [ResponsableController],
  providers: [ResponsableService],
})
export class ResponsableModule {}
