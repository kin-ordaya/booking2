import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoModalidadPeriodoService } from './recurso_curso_modalidad_periodo.service';

describe('RecursoCursoModalidadPeriodoService', () => {
  let service: RecursoCursoModalidadPeriodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecursoCursoModalidadPeriodoService],
    }).compile();

    service = module.get<RecursoCursoModalidadPeriodoService>(RecursoCursoModalidadPeriodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
