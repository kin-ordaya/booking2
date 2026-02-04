import { Periodo } from "@/periodo/entities/periodo.entity";
import { RecursoCursoModalidad } from "@/recurso_curso_modalidad/entities/recurso_curso_modalidad.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RecursoCursoModalidadPeriodo {
    @PrimaryGeneratedColumn('uuid')
      id: string;
    
      @CreateDateColumn()
      asignacion: Date;
    
      @Column({ type: 'int', default: 1 })
      estado: number;
    
      @Column()
      inicio: Date;
    
      @Column()
      fin: Date;

      @ManyToOne(()=>RecursoCursoModalidad, (recursoCursoModalidad) => recursoCursoModalidad.recursoCursoModalidadPeriodo, {
        nullable: false,
      })
      @JoinColumn({ name: 'recurso_modalidad_id' })
      recurso_curso_modalidad: RecursoCursoModalidad;

      @ManyToOne(()=>Periodo, (periodo) => periodo.recurso_curso_modalidad_periodo, {
        nullable: false,
      })
      @JoinColumn({ name: 'periodo_id' })
      periodo: Periodo;
      
}

