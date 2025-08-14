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

  @Column()
  asunto: 'ADVERTENCIA' | 'INFORMACION' | 'INSTRUCCION'; 

  @Column({ nullable: true })
  link: string;

  @ManyToOne(() => Recurso, (recurso) => recurso.seccion_email, {
    nullable: false,
  })
  @JoinColumn({ name: 'recurso_id' })
  recurso: Recurso;
}
