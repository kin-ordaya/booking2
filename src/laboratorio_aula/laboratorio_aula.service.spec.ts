import { Test, TestingModule } from '@nestjs/testing';
import { LaboratorioAulaService } from './laboratorio_aula.service';

describe('LaboratorioAulaService', () => {
  let service: LaboratorioAulaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaboratorioAulaService],
    }).compile();

    service = module.get<LaboratorioAulaService>(LaboratorioAulaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
