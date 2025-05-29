import { Test, TestingModule } from '@nestjs/testing';
import { ContactoController } from './contacto.controller';
import { ContactoService } from './contacto.service';

describe('ContactoController', () => {
  let controller: ContactoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactoController],
      providers: [ContactoService],
    }).compile();

    controller = module.get<ContactoController>(ContactoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
