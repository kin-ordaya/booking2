import { Test, TestingModule } from '@nestjs/testing';
import { PowerbiService } from './powerbi.service';

describe('PowerbiService', () => {
  let service: PowerbiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PowerbiService],
    }).compile();

    service = module.get<PowerbiService>(PowerbiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
