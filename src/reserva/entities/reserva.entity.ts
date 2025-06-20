import { Clase } from "src/clase/entities/clase.entity";
import { DetalleReserva } from "src/detalle_reserva/entities/detalle_reserva.entity";
import { Recurso } from "src/recurso/entities/recurso.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  codigo: string;

  @Column({ type: 'int', default: 0 })
  mantenimiento: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  descripcion?: string;

  @Column({ type: 'date'})
  programacion: string;

  @Column({ type: 'int'})
  cantidad: number;

  @ManyToOne(() => Clase, (clase) => clase.reserva, {
    nullable: true,
  })
  @JoinColumn({ name: 'clase_id' })
  clase?: Clase;

  @ManyToOne(() => Recurso, (recurso) => recurso.reserva, {
    nullable: false,
  })
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;

  @ManyToOne(() => Usuario, (usuario) => usuario.reserva, {
    nullable: false,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => DetalleReserva, (detalleReserva) => detalleReserva.reserva)
  detalle_reserva: DetalleReserva[];
}
