// src/models/events/formats/formats.repository.ts
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../db/database.service";
import { Format } from "./entities/format.entity";


@Injectable()
export class FormatsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(format: Partial<Format>): Promise<Partial<Format>> {
        return this.db.eventFormat.create({ data: format as any });
    }

    async findAll(): Promise<Partial<Format>[]> {
        return this.db.eventFormat.findMany();
    }

    async findById(id: number): Promise<Partial<Format> | null> {
        return this.db.eventFormat.findUnique({ where: { id } });
    }
}
