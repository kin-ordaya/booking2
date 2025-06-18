import { Module } from '@nestjs/common';
import { PabellonService } from './pabellon.service';
import { PabellonController } from './pabellon.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pabellon } from './entities/pabellon.entity';
import { Campus } from 'src/campus/entities/campus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pabellon, Campus])],
  controllers: [PabellonController],
  providers: [PabellonService],
})
export class PabellonModule {}
