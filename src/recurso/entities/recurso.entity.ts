import { Credencial } from 'src/credencial/entities/credencial.entity';
import { DeclaracionJurada } from 'src/declaracion_jurada/entities/declaracion_jurada.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
import { SeccionEmail } from 'src/seccion_email/entities/seccion_email.entity';
import { TipoAcceso } from 'src/tipo_acceso/entities/tipo_acceso.entity';
import { TipoRecurso } from 'src/tipo_recurso/entities/tipo_recurso.entity';
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
export class Recurso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  descripcion?: string;

  // @Column({ type: 'int', nullable: true })
  // cantidad_credenciales?: number;

  @Column({ type: 'varchar', length: 255 })
  link_declaracion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link_guia?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link_aula_virtual?: string;

  @Column({ type: 'int' })
  tiempo_reserva: number;

  // @Column({ type: 'varchar', length: 50, nullable: true })
  // credencial_tipo?:string

  @Column({ type: 'int'})
  capacidad: number;

  @ManyToOne(() => TipoRecurso, (tipoRecurso) => tipoRecurso.recursos, {
    nullable: false,
  })
  @JoinColumn({ name: 'tipo_recurso_id' })
  tipoRecurso: TipoRecurso;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.recursos, {
    nullable: false,
  })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @OneToMany(() => RecursoCurso, (recursoCurso) => recursoCurso.recurso)
  recurso_curso: RecursoCurso[];

  @OneToMany(() => Responsable, (responsable) => responsable.recurso)
  responsable: Responsable[];

  @OneToMany(() => SeccionEmail, (seccionEmail) => seccionEmail.recurso)
  seccion_email: SeccionEmail[];

  @OneToMany(() => Reserva, (reserva) => reserva.recurso)
  reserva: Reserva[];

  @OneToMany(() => Credencial, (credencial) => credencial.recurso)
  credencial: Credencial[];

  @OneToMany(()=> DeclaracionJurada, (declaracionJurada) => declaracionJurada.recurso)
  declaracionJurada: DeclaracionJurada[];

  @ManyToOne(() => TipoAcceso, (tipoAcceso) => tipoAcceso.recursos, {
    nullable: false,
  })
  @JoinColumn({ name: 'tipo_acceso_id' })
  tipoAcceso: TipoAcceso;
}
