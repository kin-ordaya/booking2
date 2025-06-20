import { ClaseAula } from 'src/clase_aula/entities/clase_aula.entity';
import { LaboratorioAula } from 'src/laboratorio_aula/entities/laboratorio_aula.entity';
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

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  codigo?: string;

  @ManyToOne(() => Pabellon, (pabellon) => pabellon.aula, {nullable: false})
  @JoinColumn({ name: 'campus_id' })
  pabellon: Pabellon;

  // @OneToMany(() => Clase, (clase) => clase.aula)
  // clase: Clase[];

  @OneToMany(()=> LaboratorioAula, (laboratorioAula) => laboratorioAula.laboratorio)
  laboratorioAula: LaboratorioAula[];

  @OneToMany(()=>ClaseAula, (claseAula) => claseAula.aula)
  claseAula: ClaseAula[];
}
