import { Module } from '@nestjs/common';
import { HorarioService } from './horario.service';
import { HorarioController } from './horario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horario } from './entities/horario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Horario])],
  controllers: [HorarioController],
  providers: [HorarioService],
})
export class HorarioModule {}
