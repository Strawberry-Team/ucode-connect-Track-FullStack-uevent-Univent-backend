// src/models/events/formats/formats.repository.ts
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../db/database.service";
import { EventFormat } from "./entities/event-format.entity"


@Injectable()
export class EventFormatsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(format: Partial<EventFormat>): Promise<Partial<EventFormat>> {
        return this.db.eventFormat.create({ data: format as any });
    }

    async findAll(): Promise<Partial<EventFormat>[]> {
        return this.db.eventFormat.findMany();
    }

    async findById(id: number): Promise<Partial<EventFormat> | null> {
        return this.db.eventFormat.findUnique({ where: { id } });
    }
}
