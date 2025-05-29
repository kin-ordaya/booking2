import { Test, TestingModule } from '@nestjs/testing';
import { CursoModalidadService } from './curso_modalidad.service';

describe('CursoModalidadService', () => {
  let service: CursoModalidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursoModalidadService],
    }).compile();

    service = module.get<CursoModalidadService>(CursoModalidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
