import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoModalidadService } from './recurso_curso_modalidad.service';

describe('RecursoCursoModalidadService', () => {
  let service: RecursoCursoModalidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecursoCursoModalidadService],
    }).compile();

    service = module.get<RecursoCursoModalidadService>(RecursoCursoModalidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
