import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  creacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuario: Usuario[];
}
