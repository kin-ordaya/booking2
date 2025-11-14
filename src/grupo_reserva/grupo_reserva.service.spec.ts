import { Test, TestingModule } from '@nestjs/testing';
import { GrupoReservaService } from './grupo_reserva.service';

describe('GrupoReservaService', () => {
  let service: GrupoReservaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GrupoReservaService],
    }).compile();

    service = module.get<GrupoReservaService>(GrupoReservaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
