import { Aula } from 'src/aula/entities/aula.entity';
import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Clase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 50 })
  nrc: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nrc_secundario?: string;

  @Column({ type: 'int' })
  inscritos: number;

  @Column({ type: 'varchar', length: 50 })
  periodo: string;

  @Column({ type: 'varchar', length: 50 })
  horario: string;

  @Column({ type: 'varchar', length: 50 })
  bloque: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'date' })
  inicio: Date;

  @Column({ type: 'date' })
  fin: Date;

  @ManyToOne(() => CursoModalidad, (cursoModalidad) => cursoModalidad.clase)
  @JoinColumn({ name: 'curso_modalidad_id' })
  cursoModalidad: CursoModalidad;

  @ManyToOne(() => Aula, (aula) => aula.clase)
  @JoinColumn({ name: 'aula_id' })
  aula: Aula;

  @OneToMany(() => Responsable, (responsable) => responsable.clase)
  responsable: Responsable[];
}
