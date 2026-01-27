import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PowerbiService {
  constructor(private dataSource: DataSource) {}

  async getReservasData(): Promise<any> {
    let query = 'SELECT * FROM vista_reserva_clase_detalle WHERE 1=1';
    return this.dataSource.query(query);
  }
}
