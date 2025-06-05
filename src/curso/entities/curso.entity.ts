import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
import { Eap } from 'src/eap/entities/eap.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
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
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  descripcion?: string;

  @ManyToOne(() => Eap, (eap) => eap.cursos, { nullable: true })
  @JoinColumn({ name: 'eap_id' })
  eap?: Eap;

  @ManyToOne(() => Plan, (plan) => plan.cursos, {
    nullable: false,
  })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @OneToMany(() => CursoModalidad, (cursoModalidad) => cursoModalidad.curso)
  curso_modalidad: CursoModalidad[];

  @OneToMany(() => RecursoCurso, (recursoCurso) => recursoCurso.curso)
  recurso_curso: RecursoCurso[];
}
