import { Test, TestingModule } from '@nestjs/testing';
import { PabellonService } from './pabellon.service';

describe('PabellonService', () => {
  let service: PabellonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PabellonService],
    }).compile();

    service = module.get<PabellonService>(PabellonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
