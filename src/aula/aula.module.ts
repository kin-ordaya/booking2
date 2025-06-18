import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AulaService } from './aula.service';
import { AulaController } from './aula.controller';
import { Pabellon } from 'src/pabellon/entities/pabellon.entity';
import { Aula } from './entities/aula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pabellon, Aula])],
  controllers: [AulaController],
  providers: [AulaService],
})
export class AulaModule {}
