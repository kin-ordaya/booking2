import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MatriculaClaseService } from './matricula_clase.service';
import { MatriculaClaseController } from './matricula_clase.controller';
import { MatriculaClase } from './entities/matricula_clase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatriculaClase])],
  controllers: [MatriculaClaseController],
  providers: [MatriculaClaseService],
})
export class MatriculaClaseModule {}
