import { Clase } from 'src/clase/entities/clase.entity';
import { Curso } from 'src/curso/entities/curso.entity';
import { Modalidad } from 'src/modalidad/entities/modalidad.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
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

  @OneToMany(() => Clase, (clase) => clase.cursoModalidad)
  clase: Clase[];

  @OneToMany(() => Responsable, (responsable) => responsable.cursoModalidad)
  responsable: Responsable[];
}
