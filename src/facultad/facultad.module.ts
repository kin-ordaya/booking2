import { Module } from '@nestjs/common';
import { FacultadService } from './facultad.service';
import { FacultadController } from './facultad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facultad } from './entities/facultad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Facultad])],
  controllers: [FacultadController],
  providers: [FacultadService],
})
export class FacultadModule {}
