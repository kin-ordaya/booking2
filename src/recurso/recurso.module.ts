import { Module } from '@nestjs/common';
import { RecursoService } from './recurso.service';
import { RecursoController } from './recurso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recurso } from './entities/recurso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recurso])],
  controllers: [RecursoController],
  providers: [RecursoService],
})
export class RecursoModule {}
