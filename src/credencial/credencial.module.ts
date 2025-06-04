import { Module } from '@nestjs/common';
import { CredencialService } from './credencial.service';
import { CredencialController } from './credencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from './entities/credencial.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Recurso])],
  controllers: [CredencialController],
  providers: [CredencialService],
})
export class CredencialModule {}
