import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AulaService } from './aula.service';
import { AulaController } from './aula.controller';
import { Aula } from './entities/aula.entity';
import { Campus } from 'src/campus/entities/campus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aula, Campus])],
  controllers: [AulaController],
  providers: [AulaService],
})
export class AulaModule {}
