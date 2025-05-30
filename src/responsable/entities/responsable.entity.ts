import { Clase } from 'src/clase/entities/clase.entity';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
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
export class Responsable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(()=>RolUsuario, (rolUsuario) => rolUsuario.responsable)
  @JoinColumn({ name: 'rol_usuario_id' })
  rolUsuario: RolUsuario;

  @ManyToOne(()=>Recurso, (recurso) => recurso.responsable)
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;

  @ManyToOne(()=>Clase, (clase) => clase.responsable)
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;

  @ManyToOne(()=>CursoModalidad, (cursoModalidad) => cursoModalidad.responsable)
  @JoinColumn({ name: 'curso_modalidad_id' })
  cursoModalidad: CursoModalidad;
}
