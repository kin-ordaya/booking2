import { Clase } from 'src/clase/entities/clase.entity';
import { Pabellon } from 'src/pabellon/entities/pabellon.entity';
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
export class Aula {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @ManyToOne(() => Pabellon, (pabellon) => pabellon.aula, {nullable: false})
  @JoinColumn({ name: 'campus_id' })
  pabellon: Pabellon;

  @OneToMany(() => Clase, (clase) => clase.aula)
  clase: Clase[];
}
