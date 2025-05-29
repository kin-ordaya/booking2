import { Test, TestingModule } from '@nestjs/testing';
import { CursoModalidadController } from './curso_modalidad.controller';
import { CursoModalidadService } from './curso_modalidad.service';

describe('CursoModalidadController', () => {
  let controller: CursoModalidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CursoModalidadController],
      providers: [CursoModalidadService],
    }).compile();

    controller = module.get<CursoModalidadController>(CursoModalidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
