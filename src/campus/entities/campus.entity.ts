import { Laboratorio } from 'src/laboratorio/entities/laboratorio.entity';
import { Pabellon } from 'src/pabellon/entities/pabellon.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Campus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @OneToMany(() => Pabellon, (pabellon) => pabellon.campus)
  pabellon: Pabellon[];

  @OneToMany(()=> Responsable, (responsable) => responsable.campus)
  responsable: Responsable[];

  @OneToMany(()=> Laboratorio, (laboratorio) => laboratorio.campus)
  laboratorio: Laboratorio[];
}
