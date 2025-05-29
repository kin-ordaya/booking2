import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoService } from './recurso_curso.service';

describe('RecursoCursoService', () => {
  let service: RecursoCursoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecursoCursoService],
    }).compile();

    service = module.get<RecursoCursoService>(RecursoCursoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
