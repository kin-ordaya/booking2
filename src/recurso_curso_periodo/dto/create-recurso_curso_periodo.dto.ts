import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class CreateRecursoCursoPeriodoDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;
}
