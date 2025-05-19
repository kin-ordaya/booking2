import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  descripcion: string;
}
