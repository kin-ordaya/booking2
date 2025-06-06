import { Module } from '@nestjs/common';
import { CredencialService } from './credencial.service';
import { CredencialController } from './credencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from './entities/credencial.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Rol } from 'src/rol/entities/rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credencial, Recurso, Rol])],
  controllers: [CredencialController],
  providers: [CredencialService],
})
export class CredencialModule {}
