import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../db/database.service";
import { Event } from "./entities/events.entity";


@Injectable()
export class EventsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(event: Partial<Event>): Promise<Event> {
        return this.db.event.create({ data: event as any });
    }

    async findById(id: number): Promise<Event | null> {
        return this.db.event.findUnique({ where: { id } });
    }

    async findByCompanyId(companyId: number): Promise<Event[]> {
        return this.db.event.findMany({ where: { companyId } });
    }

    async update(id: number, event: Event): Promise<Event> {
        return this.db.event.update({ where: { id }, data: event });
    }

    async delete(id: number): Promise<void> {
        await this.db.event.delete({ where: { id } });
    }

    async findAll(): Promise<Event[]> {
        return this.db.event.findMany();
    }
}