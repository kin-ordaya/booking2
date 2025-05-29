import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoIdentidadController } from './documento_identidad.controller';
import { DocumentoIdentidadService } from './documento_identidad.service';

describe('DocumentoIdentidadController', () => {
  let controller: DocumentoIdentidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoIdentidadController],
      providers: [DocumentoIdentidadService],
    }).compile();

    controller = module.get<DocumentoIdentidadController>(DocumentoIdentidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
