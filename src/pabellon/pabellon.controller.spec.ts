import { Test, TestingModule } from '@nestjs/testing';
import { PabellonController } from './pabellon.controller';
import { PabellonService } from './pabellon.service';

describe('PabellonController', () => {
  let controller: PabellonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PabellonController],
      providers: [PabellonService],
    }).compile();

    controller = module.get<PabellonController>(PabellonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
