import { Recurso } from 'src/recurso/entities/recurso.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DeclaracionJurada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(() => RolUsuario, (rolUsuario) => rolUsuario.declaracionJurada)
  @JoinColumn({ name: 'rol_usuario_id' })
  rolUsuario: RolUsuario;

  @ManyToOne(()=> Recurso , (recurso) => recurso.declaracionJurada)
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;
}
