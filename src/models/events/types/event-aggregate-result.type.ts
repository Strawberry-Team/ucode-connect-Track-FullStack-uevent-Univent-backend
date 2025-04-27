import { Event } from '../entities/event.entity';
import { EventSortField, SortOrder } from '../dto/event-aggregation.dto';

export type AppliedFilter = {
    field: string;
    value: string | number | Date | string[] | number[];
};

export type EventAggregateResult = {
    items: Event[];
    filteredBy: AppliedFilter[];
    count: number;
    total: number;
    minPrice: number | null;
    maxPrice: number | null;
    sortedBy: {
        field: EventSortField;
        order: SortOrder;
    };
}; 