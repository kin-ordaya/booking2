import { Test, TestingModule } from '@nestjs/testing';
import { ClaseAulaController } from './clase_aula.controller';
import { ClaseAulaService } from './clase_aula.service';

describe('ClaseAulaController', () => {
  let controller: ClaseAulaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaseAulaController],
      providers: [ClaseAulaService],
    }).compile();

    controller = module.get<ClaseAulaController>(ClaseAulaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
