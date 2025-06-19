import { Test, TestingModule } from '@nestjs/testing';
import { LaboratorioController } from './laboratorio.controller';
import { LaboratorioService } from './laboratorio.service';

describe('LaboratorioController', () => {
  let controller: LaboratorioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaboratorioController],
      providers: [LaboratorioService],
    }).compile();

    controller = module.get<LaboratorioController>(LaboratorioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
