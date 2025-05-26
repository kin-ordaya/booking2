import { Curso } from 'src/curso/entities/curso.entity';
import { Facultad } from 'src/facultad/entities/facultad.entity';
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
export class Eap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @ManyToOne(() => Facultad, (facultad) => facultad.eaps, { nullable: false })
  @JoinColumn({ name: 'facultad_id' })
  facultad: Facultad;

  @OneToMany(() => Curso, (curso) => curso.eap)
  cursos: Curso[];
}
