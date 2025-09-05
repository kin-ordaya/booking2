import { Recurso } from 'src/recurso/entities/recurso.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class SeccionEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  asunto: 'ADVERTENCIA' | 'INFORMACION' | 'INSTRUCCION'; 

  @Column({ nullable: false })
  tipo: 'LINK' | 'IMAGEN';

  @Column({ nullable: false })
  link: string;

  @ManyToOne(() => Recurso, (recurso) => recurso.seccion_email, {
    nullable: false,
  })
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;
}
