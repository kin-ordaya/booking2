import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoModalidadController } from './recurso_curso_modalidad.controller';
import { RecursoCursoModalidadService } from './recurso_curso_modalidad.service';

describe('RecursoCursoModalidadController', () => {
  let controller: RecursoCursoModalidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecursoCursoModalidadController],
      providers: [RecursoCursoModalidadService],
    }).compile();

    controller = module.get<RecursoCursoModalidadController>(RecursoCursoModalidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
