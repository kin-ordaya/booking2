import { Test, TestingModule } from '@nestjs/testing';
import { ClaseAulaService } from './clase_aula.service';

describe('ClaseAulaService', () => {
  let service: ClaseAulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaseAulaService],
    }).compile();

    service = module.get<ClaseAulaService>(ClaseAulaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
