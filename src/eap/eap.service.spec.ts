import { Test, TestingModule } from '@nestjs/testing';
import { EapService } from './eap.service';

describe('EapService', () => {
  let service: EapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EapService],
    }).compile();

    service = module.get<EapService>(EapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
