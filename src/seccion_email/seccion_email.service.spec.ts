import { Test, TestingModule } from '@nestjs/testing';
import { SeccionEmailService } from './seccion_email.service';

describe('SeccionEmailService', () => {
  let service: SeccionEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeccionEmailService],
    }).compile();

    service = module.get<SeccionEmailService>(SeccionEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
