import { Reserva } from 'src/reserva/entities/reserva.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('grupo_reserva')
export class GrupoReserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column()
  tipo: string; // 'GENERAL_MULTIPLE', 'MIXTO_MULTIPLE', 'GENERAL_MANTENIMIENTO_MULTIPLE' , 'MIXTO_MANTENIMIENTO_MULTIPLE'

  @Column()
  recurso_id: string;

  @Column()
  autor_id: string;

  @Column({ nullable: true })
  clase_id?: string;

  @Column({ nullable: true })
  docente_id?: string;

  @Column()
  cantidad_reservas: number;

  @OneToMany(() => Reserva, (reserva) => reserva.grupo_reserva)
  reservas: Reserva[];
}
