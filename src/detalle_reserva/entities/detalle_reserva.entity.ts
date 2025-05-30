import { Credencial } from 'src/credencial/entities/credencial.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DetalleReserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(()=> Reserva, (reserva) => reserva.detalle_reserva)
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva;

  @ManyToOne(()=> Credencial, (credencial) => credencial.detalle_reserva)
  @JoinColumn({ name: 'credencial_id' })
  credencial: Credencial;
}
