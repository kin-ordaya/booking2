import { Module } from '@nestjs/common';
import { EapService } from './eap.service';
import { EapController } from './eap.controller';
import { Eap } from './entities/eap.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facultad } from 'src/facultad/entities/facultad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Eap, Facultad])],
  controllers: [EapController],
  providers: [EapService],
})
export class EapModule {}
