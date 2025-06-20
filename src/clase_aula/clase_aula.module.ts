import { Module } from '@nestjs/common';
import { ClaseAulaService } from './clase_aula.service';
import { ClaseAulaController } from './clase_aula.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaseAula } from './entities/clase_aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClaseAula])],
  controllers: [ClaseAulaController],
  providers: [ClaseAulaService],
})
export class ClaseAulaModule {}
