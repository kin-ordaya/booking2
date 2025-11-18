import { Periodo } from 'src/periodo/entities/periodo.entity';
import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RecursoCursoPeriodo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column()
  inicio: Date;

  @Column()
  fin: Date;

  @ManyToOne(() => RecursoCurso, (rc) => rc.recurso_curso_periodo, {
    nullable: false,
  })
  @JoinColumn({name: 'recurso_curso_id'})
  recurso_curso: RecursoCurso;

  @ManyToOne(() => Periodo, (periodo) => periodo.recurso_curso_periodo, {
    nullable: false,
  })
  @JoinColumn({name: 'periodo_id'})
  periodo: Periodo;
}
