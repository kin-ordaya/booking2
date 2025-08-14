import { Test, TestingModule } from '@nestjs/testing';
import { SeccionEmailController } from './seccion_email.controller';
import { SeccionEmailService } from './seccion_email.service';

describe('SeccionEmailController', () => {
  let controller: SeccionEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeccionEmailController],
      providers: [SeccionEmailService],
    }).compile();

    controller = module.get<SeccionEmailController>(SeccionEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
