import { Credencial } from 'src/credencial/entities/credencial.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { RecursoCurso } from 'src/recurso_curso/entities/recurso_curso.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
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

  @Column({ type: 'int', nullable: true })
  cantidad_credenciales?: number;

  @Column({ type: 'varchar', length: 255 })
  link_declaracion: string;

  @Column({ type: 'int' })
  tiempo_reserva: number;

  @ManyToOne(() => TipoRecurso, (tipoRecurso) => tipoRecurso.recursos)
  @JoinColumn({ name: 'tipo_recurso_id' })
  tipoRecurso: TipoRecurso;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.recursos)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @OneToMany(() => RecursoCurso, (recursoCurso) => recursoCurso.recurso)
  recurso_curso: RecursoCurso[];

  @OneToMany(() => Responsable, (responsable) => responsable.recurso)
  responsable: Responsable[];

  @OneToMany(() => Reserva, (reserva) => reserva.recurso)
  reserva: Reserva[];

  @OneToMany(() => Credencial, (credencial) => credencial.recurso)
  credencial: Credencial[];
}
