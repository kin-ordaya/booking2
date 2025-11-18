import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoPeriodoService } from './recurso_curso_periodo.service';

describe('RecursoCursoPeriodoService', () => {
  let service: RecursoCursoPeriodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecursoCursoPeriodoService],
    }).compile();

    service = module.get<RecursoCursoPeriodoService>(RecursoCursoPeriodoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
