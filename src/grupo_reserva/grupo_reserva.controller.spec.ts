import { Test, TestingModule } from '@nestjs/testing';
import { GrupoReservaController } from './grupo_reserva.controller';
import { GrupoReservaService } from './grupo_reserva.service';

describe('GrupoReservaController', () => {
  let controller: GrupoReservaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GrupoReservaController],
      providers: [GrupoReservaService],
    }).compile();

    controller = module.get<GrupoReservaController>(GrupoReservaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
