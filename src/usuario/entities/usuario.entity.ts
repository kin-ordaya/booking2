import { DocumentoIdentidad } from 'src/documento_identidad/entities/documento_identidad.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { RolUsuario } from 'src/rol_usuario/entities/rol_usuario.entity';
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

  @Column({ type: 'varchar', length: 100 })
  correo_institucional: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo_personal?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono_institucional?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono_personal?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sexo?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  direccion?: string;

  // @Column({ type: 'varchar', length: 50, nullable: true })
  // estado_civil?: string;

  @ManyToOne(
    () => DocumentoIdentidad,
    (documentoIdentidad) => documentoIdentidad.usuario,
    {
      nullable: false,
    },
  )
  @JoinColumn({ name: 'documento_identidad_id' })
  documento_identidad: DocumentoIdentidad;

  @OneToMany(() => RolUsuario, (rolUsuario) => rolUsuario.usuario)
  rol_usuario: RolUsuario[];

}
