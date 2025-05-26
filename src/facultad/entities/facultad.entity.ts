import { Eap } from "src/eap/entities/eap.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Facultad {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    creacion: Date;

    @Column({type:'int',default:1})
    estado: number;

    @Column({type:'varchar',length:100})
    nombre: string;

    @OneToMany(() => Eap, eap => eap.facultad)
    eaps: Eap[];
}
