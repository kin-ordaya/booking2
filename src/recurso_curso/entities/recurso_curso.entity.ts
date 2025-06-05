import { Curso } from 'src/curso/entities/curso.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class RecursoCurso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(() => Recurso, (recurso) => recurso.recurso_curso, {
    nullable: false,
  })
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;

  @ManyToOne(() => Curso, (curso) => curso.recurso_curso, {
    nullable: false,
  })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;
}
