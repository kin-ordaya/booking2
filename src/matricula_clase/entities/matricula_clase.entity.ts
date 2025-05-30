import { Clase } from 'src/clase/entities/clase.entity';
import { Estudiante } from 'src/estudiante/entities/estudiante.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class MatriculaClase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(() => Clase, (clase) => clase.matricula_clase)
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;

  @ManyToOne(() => Estudiante, (estudiante) => estudiante.matricula_clase)
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: Estudiante;
  
}
