import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../db/database.service";
import { Format } from "./entities/formats.entity";


@Injectable()
export class FormatsRepository {
    constructor(private readonly db: DatabaseService) {}

    async findById(id: number): Promise<Partial<Format> | null> {
        return this.db.eventFormat.findUnique({ where: { id } });
    }

    async findAll(): Promise<Partial<Format>[]> {
        return this.db.eventFormat.findMany();
    }

    async create(format: Partial<Format>): Promise<Partial<Format>> {
        return this.db.eventFormat.create({ data: format as any });
    }
}