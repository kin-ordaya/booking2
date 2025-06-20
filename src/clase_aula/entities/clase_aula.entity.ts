import { Aula } from 'src/aula/entities/aula.entity';
import { Clase } from 'src/clase/entities/clase.entity';
import { Horario } from 'src/horario/entities/horario.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class ClaseAula {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @OneToMany(()=> Horario, (horario) => horario.claseAula)
  horario: Horario[];

  @ManyToOne(() => Clase, (clase) => clase.claseAula, {
    nullable: false,
  })
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;

  @ManyToOne(() => Aula, (aula) => aula.claseAula, {
    nullable: false,
  })
  @JoinColumn({ name: 'aula_id' })
  aula: Aula;
}
