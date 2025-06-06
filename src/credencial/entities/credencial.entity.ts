import { DetalleReserva } from 'src/detalle_reserva/entities/detalle_reserva.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
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
export class Credencial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  usuario?: string;

  @Column({ type: 'varchar', length: 100 })
  clave: string;

  // @Column({ type: 'varchar', length: 50 })
  // tipo: string;

  @ManyToOne(() => Recurso, (recurso) => recurso.credencial, {
    nullable: false,
  })
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;

  @OneToMany(
    () => DetalleReserva,
    (detalleReserva) => detalleReserva.credencial,
  )
  detalle_reserva: DetalleReserva[];
}
