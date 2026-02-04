import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoModalidadPeriodoController } from './recurso_curso_modalidad_periodo.controller';
import { RecursoCursoModalidadPeriodoService } from './recurso_curso_modalidad_periodo.service';

describe('RecursoCursoModalidadPeriodoController', () => {
  let controller: RecursoCursoModalidadPeriodoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecursoCursoModalidadPeriodoController],
      providers: [RecursoCursoModalidadPeriodoService],
    }).compile();

    controller = module.get<RecursoCursoModalidadPeriodoController>(RecursoCursoModalidadPeriodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
