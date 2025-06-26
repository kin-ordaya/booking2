import { Test, TestingModule } from '@nestjs/testing';
import { DeclaracionJuradaService } from './declaracion_jurada.service';

describe('DeclaracionJuradaService', () => {
  let service: DeclaracionJuradaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeclaracionJuradaService],
    }).compile();

    service = module.get<DeclaracionJuradaService>(DeclaracionJuradaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
