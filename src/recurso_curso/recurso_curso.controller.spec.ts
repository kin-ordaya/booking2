import { Test, TestingModule } from '@nestjs/testing';
import { RecursoCursoController } from './recurso_curso.controller';
import { RecursoCursoService } from './recurso_curso.service';

describe('RecursoCursoController', () => {
  let controller: RecursoCursoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecursoCursoController],
      providers: [RecursoCursoService],
    }).compile();

    controller = module.get<RecursoCursoController>(RecursoCursoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
