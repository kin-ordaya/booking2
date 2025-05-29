import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
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
export class Contacto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 50 })
  nombres: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellidos?: string;

  @Column({ type: 'varchar', length: 100 })
  telefono: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo?: string;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.contactos)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;
}
