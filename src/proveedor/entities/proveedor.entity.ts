import { Contacto } from 'src/contacto/entities/contacto.entity';
import { Recurso } from 'src/recurso/entities/recurso.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Proveedor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  pais: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ruc?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  descripcion?: string;

  @OneToMany(() => Contacto, (contacto) => contacto.proveedor)
  contactos: Contacto[];

  @OneToMany(() => Recurso, (recurso) => recurso.proveedor)
  recursos: Recurso[];

}
