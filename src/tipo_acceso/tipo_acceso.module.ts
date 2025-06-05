import { Module } from '@nestjs/common';
import { TipoAccesoService } from './tipo_acceso.service';
import { TipoAccesoController } from './tipo_acceso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoAcceso } from './entities/tipo_acceso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAcceso])],
  controllers: [TipoAccesoController],
  providers: [TipoAccesoService],
})
export class TipoAccesoModule {}
