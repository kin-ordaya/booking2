import { CursoModalidad } from '@/curso_modalidad/entities/curso_modalidad.entity';
import { Recurso } from '@/recurso/entities/recurso.entity';
import { RecursoCursoModalidadPeriodo } from '@/recurso_curso_modalidad_periodo/entities/recurso_curso_modalidad_periodo.entity';
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
export class RecursoCursoModalidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(()=>CursoModalidad, (cursoModalidad) => cursoModalidad.recursoCursoModalidad, {
    nullable: false,
  })
  @JoinColumn({ name: 'curso_modalidad_id' })
  cursoModalidad: CursoModalidad;

  @ManyToOne(() => Recurso, (recurso) => recurso.recursoCursoModalidad, {
    nullable: false,
  })
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;

  @OneToMany(() => RecursoCursoModalidadPeriodo, (recursoCursoModalidadPeriodo) => recursoCursoModalidadPeriodo.recursoCursoModalidad)
  recursoCursoModalidadPeriodo: RecursoCursoModalidadPeriodo[];
}
