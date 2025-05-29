import { Curso } from 'src/curso/entities/curso.entity';
import { Modalidad } from 'src/modalidad/entities/modalidad.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class CursoModalidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(() => Curso, (curso) => curso.curso_modalidad)
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;

  @ManyToOne(() => Modalidad, (modalidad) => modalidad.curso_modalidad)
  @JoinColumn({ name: 'modalidad_id' })
  modalidad: Curso;
}
