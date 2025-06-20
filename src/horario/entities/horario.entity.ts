import { ClaseAula } from 'src/clase_aula/entities/clase_aula.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Horario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 1 })
  dia: string;

  @Column({ type: 'varchar', length: 20 })
  inicio: string;

  @Column({ type: 'varchar', length: 20 })
  fin: string;

  @ManyToOne(() => ClaseAula, (claseAula) => claseAula.horario, {
    nullable: false,
  })
  @JoinColumn({ name: 'clase_aula_id' })
  claseAula: ClaseAula;
}
