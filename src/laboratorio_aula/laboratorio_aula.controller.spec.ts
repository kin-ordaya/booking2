import { Test, TestingModule } from '@nestjs/testing';
import { LaboratorioAulaController } from './laboratorio_aula.controller';
import { LaboratorioAulaService } from './laboratorio_aula.service';

describe('LaboratorioAulaController', () => {
  let controller: LaboratorioAulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaboratorioAulaController],
      providers: [LaboratorioAulaService],
    }).compile();

    controller = module.get<LaboratorioAulaController>(LaboratorioAulaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
