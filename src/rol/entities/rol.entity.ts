import { Credencial } from 'src/credencial/entities/credencial.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => RolUsuario, (rolUsuario) => rolUsuario.rol)
  rol_usuario: RolUsuario[];
  
  @OneToMany(() => Credencial, (credencial) => credencial.rol)
  credencial: Credencial[];

}
