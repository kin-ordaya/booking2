import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoIdentidadService } from './documento_identidad.service';

describe('DocumentoIdentidadService', () => {
  let service: DocumentoIdentidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoIdentidadService],
    }).compile();

    service = module.get<DocumentoIdentidadService>(DocumentoIdentidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
