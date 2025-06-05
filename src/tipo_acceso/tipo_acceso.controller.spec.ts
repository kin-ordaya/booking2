import { Test, TestingModule } from '@nestjs/testing';
import { TipoAccesoController } from './tipo_acceso.controller';
import { TipoAccesoService } from './tipo_acceso.service';

describe('TipoAccesoController', () => {
  let controller: TipoAccesoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoAccesoController],
      providers: [TipoAccesoService],
    }).compile();

    controller = module.get<TipoAccesoController>(TipoAccesoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
