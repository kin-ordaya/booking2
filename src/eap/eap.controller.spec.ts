import { Test, TestingModule } from '@nestjs/testing';
import { EapController } from './eap.controller';
import { EapService } from './eap.service';

describe('EapController', () => {
  let controller: EapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EapController],
      providers: [EapService],
    }).compile();

    controller = module.get<EapController>(EapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
