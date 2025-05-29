import { Test, TestingModule } from '@nestjs/testing';
import { TipoRecursoService } from './tipo_recurso.service';

describe('TipoRecursoService', () => {
  let service: TipoRecursoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoRecursoService],
    }).compile();

    service = module.get<TipoRecursoService>(TipoRecursoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
