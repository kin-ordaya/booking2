import { Module } from '@nestjs/common';
import { CursoService } from './curso.service';
import { CursoController } from './curso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Eap } from 'src/eap/entities/eap.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Eap, Plan,Recurso, RolUsuario])],
  controllers: [CursoController],
  providers: [CursoService],
})
export class CursoModule {}
