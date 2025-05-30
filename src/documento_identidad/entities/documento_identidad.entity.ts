import { Estudiante } from 'src/estudiante/entities/estudiante.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class DocumentoIdentidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => Usuario, (usuario) => usuario.documento_identidad)
  usuario: Usuario[];

  @OneToMany(() => Estudiante, (estudiante) => estudiante.documento_identidad)
  estudiante: Estudiante[];
}
