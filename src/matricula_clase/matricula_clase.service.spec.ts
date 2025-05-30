import { Test, TestingModule } from '@nestjs/testing';
import { MatriculaClaseService } from './matricula_clase.service';

describe('MatriculaClaseService', () => {
  let service: MatriculaClaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatriculaClaseService],
    }).compile();

    service = module.get<MatriculaClaseService>(MatriculaClaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
