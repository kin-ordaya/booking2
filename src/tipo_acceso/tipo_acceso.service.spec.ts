import { Test, TestingModule } from '@nestjs/testing';
import { TipoAccesoService } from './tipo_acceso.service';

describe('TipoAccesoService', () => {
  let service: TipoAccesoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoAccesoService],
    }).compile();

    service = module.get<TipoAccesoService>(TipoAccesoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
