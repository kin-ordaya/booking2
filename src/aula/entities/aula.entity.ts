import { Campus } from 'src/campus/entities/campus.entity';
import { Clase } from 'src/clase/entities/clase.entity';
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

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  codigo: string;

  @Column({ type: 'int' })
  piso: number;

  @Column({ type: 'varchar', length: 10 })
  pabellon: string;

  @ManyToOne(() => Campus, (campus) => campus.aula, {
    nullable: false,
  })
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @OneToMany(() => Clase, (clase) => clase.aula)
  clase: Clase[];
}
