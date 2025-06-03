import { Recurso } from 'src/recurso/entities/recurso.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TipoRecurso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @OneToMany(() => Recurso, (recurso) => recurso.tipoRecurso)
  recursos: Recurso[];
}
