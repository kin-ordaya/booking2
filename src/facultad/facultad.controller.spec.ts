import { Test, TestingModule } from '@nestjs/testing';
import { FacultadController } from './facultad.controller';
import { FacultadService } from './facultad.service';

describe('FacultadController', () => {
  let controller: FacultadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacultadController],
      providers: [FacultadService],
    }).compile();

    controller = module.get<FacultadController>(FacultadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
