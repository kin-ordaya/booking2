import { Test, TestingModule } from '@nestjs/testing';
import { ContactoService } from './contacto.service';

describe('ContactoService', () => {
  let service: ContactoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactoService],
    }).compile();

    service = module.get<ContactoService>(ContactoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
