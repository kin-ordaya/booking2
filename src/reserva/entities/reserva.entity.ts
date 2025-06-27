import { Clase } from "src/clase/entities/clase.entity";
import { DetalleReserva } from "src/detalle_reserva/entities/detalle_reserva.entity";
import { Recurso } from "src/recurso/entities/recurso.entity";
import { RolUsuario } from "src/rol_usuario/entities/rol_usuario.entity";
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
  mantenimiento: number;

  // @Column({ type: 'varchar', length: 100, nullable: true })
  // descripcion?: string;

  // @Column({ type: 'date' })
  // fecha: Date;

  @Column({ type: 'timestamp' })
  inicio: Date;

  @Column({ type: 'timestamp' })
  fin: Date;

  @Column({ type: 'int'})
  cantidad_accesos: number;

  @Column({ type: 'int'})
  cantidad_credenciales: number;

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

  @ManyToOne(() => RolUsuario, (rolUsuario) => rolUsuario.reserva, {
    nullable: false,
  })
  @JoinColumn({ name: 'docente_id' })
  docente: RolUsuario;

  @ManyToOne(() => RolUsuario, (rolUsuario) => rolUsuario.reservaCreada, {
    nullable: false,
  })
  @JoinColumn({ name: 'autor_id' })
  autor: RolUsuario;

  @OneToMany(() => DetalleReserva, (detalleReserva) => detalleReserva.reserva)
  detalle_reserva: DetalleReserva[];
}
