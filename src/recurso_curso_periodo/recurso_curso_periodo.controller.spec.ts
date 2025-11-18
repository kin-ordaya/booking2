import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoPeriodoController } from './recurso_curso_periodo.controller';
import { RecursoCursoPeriodoService } from './recurso_curso_periodo.service';

describe('RecursoCursoPeriodoController', () => {
  let controller: RecursoCursoPeriodoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecursoCursoPeriodoController],
      providers: [RecursoCursoPeriodoService],
    }).compile();

    controller = module.get<RecursoCursoPeriodoController>(RecursoCursoPeriodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
