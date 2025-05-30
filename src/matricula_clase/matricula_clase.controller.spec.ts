import { Test, TestingModule } from '@nestjs/testing';
import { MatriculaClaseController } from './matricula_clase.controller';
import { MatriculaClaseService } from './matricula_clase.service';

describe('MatriculaClaseController', () => {
  let controller: MatriculaClaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatriculaClaseController],
      providers: [MatriculaClaseService],
    }).compile();

    controller = module.get<MatriculaClaseController>(MatriculaClaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
