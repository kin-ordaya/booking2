import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateRolUsuarioDto } from './dto/create-rol_usuario.dto';
import { UpdateRolUsuarioDto } from './dto/update-rol_usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolUsuario } from './entities/rol_usuario.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class RolUsuarioService {
  constructor(
    @InjectRepository(RolUsuario)
    private readonly rolUsuarioRepository: Repository<RolUsuario>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRolUsuarioDto: CreateRolUsuarioDto) {
    try {
      const { usuario_id, rol_id } = createRolUsuarioDto;

      const [usuarioExists, rolExists] = await Promise.all([
        this.usuarioRepository.existsBy({ id: usuario_id }),
        this.rolRepository.existsBy({ id: rol_id }),
      ]);

      if (!usuarioExists)
        throw new NotFoundException('No existe un usuario con ese id');
      if (!rolExists)
        throw new NotFoundException('No existe un rol con ese id');

      const rolUsuarioExists = await this.rolUsuarioRepository.existsBy({
        usuario: { id: usuario_id },
        rol: { id: rol_id },
      });

      if (rolUsuarioExists)
        throw new NotFoundException('Ya existe una asignacion de rol a usuario');

      const rolUsuario = this.rolUsuarioRepository.create({
        usuario: { id: usuario_id },
        rol: { id: rol_id },
      });
      return await this.rolUsuarioRepository.save(rolUsuario);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error inesperado');
      
    }
  }

  async findAll() {
    return `This action returns all rolUsuario`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} rolUsuario`;
  }

  async update(id: string, updateRolUsuarioDto: UpdateRolUsuarioDto) {
    return `This action updates a #${id} rolUsuario`;
  }

  async remove(id: string) {
    return `This action removes a #${id} rolUsuario`;
  }
}
