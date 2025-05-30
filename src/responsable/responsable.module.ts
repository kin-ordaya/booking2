import { Module } from '@nestjs/common';
import { ResponsableService } from './responsable.service';
import { ResponsableController } from './responsable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Responsable } from './entities/responsable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Responsable])],
  controllers: [ResponsableController],
  providers: [ResponsableService],
})
export class ResponsableModule {}
