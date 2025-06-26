import { Test, TestingModule } from '@nestjs/testing';
import { DeclaracionJuradaController } from './declaracion_jurada.controller';
import { DeclaracionJuradaService } from './declaracion_jurada.service';

describe('DeclaracionJuradaController', () => {
  let controller: DeclaracionJuradaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeclaracionJuradaController],
      providers: [DeclaracionJuradaService],
    }).compile();

    controller = module.get<DeclaracionJuradaController>(DeclaracionJuradaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
