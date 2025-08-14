import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSeccionEmailDto } from './dto/create-seccion_email.dto';
import { UpdateSeccionEmailDto } from './dto/update-seccion_email.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SeccionEmail } from './entities/seccion_email.entity';
import { Repository } from 'typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';

@Injectable()
export class SeccionEmailService {
  constructor(
    @InjectRepository(SeccionEmail)
    private readonly seccionEmailRepository: Repository<SeccionEmail>,
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
  ) {}

  async create(createSeccionEmailDto: CreateSeccionEmailDto) {
    try {
      const { asunto, link, recurso_id } = createSeccionEmailDto;

      const recurso = await this.recursoRepository.findOneBy({ id: recurso_id });
      if (!recurso) throw new NotFoundException('Recurso no encontrado');

      const seccionEmail = this.seccionEmailRepository.create({
        asunto,
        link,
        recurso,
      });

      return await this.seccionEmailRepository.save(seccionEmail);
    } catch (error) {
      if(error instanceof NotFoundException){
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
    }
  }

  findAll() {
    return `This action returns all seccionEmail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seccionEmail`;
  }

  update(id: number, updateSeccionEmailDto: UpdateSeccionEmailDto) {
    return `This action updates a #${id} seccionEmail`;
  }

  remove(id: number) {
    return `This action removes a #${id} seccionEmail`;
  }
}
