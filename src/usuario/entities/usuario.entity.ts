import { Cargo } from 'src/cargo/entities/cargo.entity';
import { DocumentoIdentidad } from 'src/documento_identidad/entities/documento_identidad.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 150 })
  apellidos: string;

  @Column({ type: 'varchar', length: 100 })
  numero_documento: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo_institucional?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo_personal?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono_institucional?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono_personal?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sexo?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  direccion?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estado_civil?: string;

  @ManyToOne(
    () => DocumentoIdentidad,
    (documentoIdentidad) => documentoIdentidad.usuario,
  )
  @JoinColumn({ name: 'documento_identidad_id' })
  documento_identidad: DocumentoIdentidad;

  @ManyToOne(() => Rol, (rol) => rol.usuario)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Cargo, (cargo) => cargo.usuario, { nullable: true })
  @JoinColumn({ name: 'cargo_id' })
  cargo?: Cargo;
}
