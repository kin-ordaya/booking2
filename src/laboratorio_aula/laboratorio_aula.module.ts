import { Module } from '@nestjs/common';
import { LaboratorioAulaService } from './laboratorio_aula.service';
import { LaboratorioAulaController } from './laboratorio_aula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratorio } from 'src/laboratorio/entities/laboratorio.entity';
import { Aula } from 'src/aula/entities/aula.entity';
import { LaboratorioAula } from './entities/laboratorio_aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LaboratorioAula, Laboratorio, Aula])],
  controllers: [LaboratorioAulaController],
  providers: [LaboratorioAulaService],
})
export class LaboratorioAulaModule {}
