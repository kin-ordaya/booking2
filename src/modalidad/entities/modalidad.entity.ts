import { CursoModalidad } from 'src/curso_modalidad/entities/curso_modalidad.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Modalidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @OneToMany(() => CursoModalidad, (cursoModalidad) => cursoModalidad.modalidad)
  curso_modalidad: CursoModalidad[];
}
