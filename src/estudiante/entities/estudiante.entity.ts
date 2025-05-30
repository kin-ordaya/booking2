import { DocumentoIdentidad } from 'src/documento_identidad/entities/documento_identidad.entity';
import { MatriculaClase } from 'src/matricula_clase/entities/matricula_clase.entity';
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
export class Estudiante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos: string;

  @Column({ type: 'varchar', length: 100 })
  numero_documento: string;

  @Column({ type: 'varchar', length: 100 })
  correo: string;

  @Column({ type: 'varchar', length: 20 })
  telefono?: string;

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

  @OneToMany(() => MatriculaClase, (matriculaClase) => matriculaClase.estudiante)
  matricula_clase: MatriculaClase[];
}
