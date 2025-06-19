import { Test, TestingModule } from '@nestjs/testing';
import { LaboratorioService } from './laboratorio.service';

describe('LaboratorioService', () => {
  let service: LaboratorioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaboratorioService],
    }).compile();

    service = module.get<LaboratorioService>(LaboratorioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
