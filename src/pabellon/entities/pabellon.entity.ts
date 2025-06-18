import { Aula } from 'src/aula/entities/aula.entity';
import { Campus } from 'src/campus/entities/campus.entity';
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
export class Pabellon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 1 })
  nombre: string;

  @ManyToOne(() => Campus, (campus) => campus.pabellon, { nullable: false })
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @OneToMany(() => Aula, (aula) => aula.pabellon)
  aula: Aula[];
}
