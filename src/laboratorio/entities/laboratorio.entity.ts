import { Campus } from 'src/campus/entities/campus.entity';
import { LaboratorioAula } from 'src/laboratorio_aula/entities/laboratorio_aula.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Laboratorio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @ManyToOne(() => Campus, (campus) => campus.laboratorio, { nullable: false })
  @JoinColumn({ name: 'campus_id' })
  campus: Campus;

  @OneToMany(() => LaboratorioAula, (laboratorioAula) => laboratorioAula.laboratorio)
  laboratorioAula: LaboratorioAula[];
}
