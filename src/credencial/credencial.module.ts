import { Module } from '@nestjs/common';
import { CredencialService } from './credencial.service';
import { CredencialController } from './credencial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credencial } from './entities/credencial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credencial])],
  controllers: [CredencialController],
  providers: [CredencialService],
})
export class CredencialModule {}
