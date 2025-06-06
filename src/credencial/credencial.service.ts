import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCredencialDto } from './dto/create-credencial.dto';
import { UpdateCredencialDto } from './dto/update-credencial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credencial } from './entities/credencial.entity';
import { Repository } from 'typeorm';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Rol } from 'src/rol/entities/rol.entity';

@Injectable()
export class CredencialService {
  constructor(
    @InjectRepository(Credencial)
    private readonly credencialRepository: Repository<Credencial>,

    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createCredencialDto: CreateCredencialDto) {
    try {
      const { usuario, clave, recurso_id, rol_id } = createCredencialDto;

      const [recursoExists, rolExists] = await Promise.all([
        this.recursoRepository.findOne({
          where: { id: recurso_id },
          relations: ['tipoAcceso'],
        }),
        this.rolRepository.existsBy({ id: rol_id }),
      ]);

      if (!recursoExists)
        throw new NotFoundException('No existe un recurso con ese id');

      if (!rolExists)
        throw new NotFoundException('No existe un rol con ese id');

      // Validación según tipo de acceso
      const tipoAcceso = recursoExists.tipoAcceso.nombre;

      if (tipoAcceso === 'USERPASS') {
        // Para USERPASS, ambos campos son obligatorios
        if (!usuario || !clave) {
          throw new BadRequestException(
            'Para recursos de tipo USERPASS, debe ingresar usuario y clave',
          );
        }
      } else if (tipoAcceso === 'KEY') {
        // Para KEY, solo la clave es obligatoria
        if (!clave) {
          throw new BadRequestException(
            'Para recursos de tipo KEY, debe ingresar la clave',
          );
        }
        // Limpiamos el usuario si fue enviado (opcional)
        createCredencialDto.usuario = undefined;
      } else {
        throw new BadRequestException('Tipo de acceso no válido');
      }

      const credencial = this.credencialRepository.create({
        usuario,
        clave,
        recurso: { id: recurso_id },
        rol: { id: rol_id },
      });

      return await this.credencialRepository.save(credencial);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Error inesperado');
    }
  }
  //TODO: Implementar
  findAll() {
    return `This action returns all credencial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} credencial`;
  }

  update(id: number, updateCredencialDto: UpdateCredencialDto) {
    return `This action updates a #${id} credencial`;
  }

  remove(id: number) {
    return `This action removes a #${id} credencial`;
  }
}
