import { Aula } from 'src/aula/entities/aula.entity';
import { Laboratorio } from 'src/laboratorio/entities/laboratorio.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class LaboratorioAula {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(() => Laboratorio, (laboratorio) => laboratorio.laboratorioAula, {
    nullable: false,
  })
  @JoinColumn({ name: 'laboratorio_id' })
  laboratorio: Laboratorio;

  @ManyToOne(() => Aula, (aula) => aula.laboratorioAula, {
    nullable: false,
  })
  @JoinColumn({ name: 'aula_id' })
  aula: Aula;
}
