import { Responsable } from 'src/responsable/entities/responsable.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class RolUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.rol_usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Rol, (rol) => rol.rol_usuario)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @OneToMany(() => Responsable, (responsable) => responsable.rolUsuario)
  responsable: Responsable[];
}
