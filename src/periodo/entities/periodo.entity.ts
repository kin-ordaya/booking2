import { Clase } from 'src/clase/entities/clase.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Periodo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 7 })
  nombre: string;

  @Column({ type: 'date' })
  inicio: Date;

  @Column({ type: 'date' })
  fin: Date;

  @OneToMany(()=>Clase, (clase) => clase.periodo)
  clase: Clase[];
}
