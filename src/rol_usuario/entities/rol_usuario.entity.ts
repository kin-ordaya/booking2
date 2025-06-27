import { DeclaracionJurada } from 'src/declaracion_jurada/entities/declaracion_jurada.entity';
import { Reserva } from 'src/reserva/entities/reserva.entity';
import { Responsable } from 'src/responsable/entities/responsable.entity';
import { Rol } from 'src/rol/entities/rol.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class RolUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  asignacion: Date;

  @Column({ type: 'int', default: 1 })
  estado: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.rol_usuario, {
    nullable: false,
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Rol, (rol) => rol.rol_usuario, {
    nullable: false,
  })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @OneToMany(() => Responsable, (responsable) => responsable.rolUsuario)
  responsable: Responsable[];

  @OneToMany(()=> Reserva , (reserva) => reserva.docente)
  reserva: Reserva[];

  @OneToMany(()=> Reserva , (reserva) => reserva.autor)
  reservaCreada: Reserva[];

  @OneToMany(()=> DeclaracionJurada, (declaracionJurada) => declaracionJurada.rolUsuario)
  declaracionJurada: DeclaracionJurada[];

  // @OneToMany(()=> Clase, (clase) => clase.rolUsuario)
  // clase: Clase[];

}
