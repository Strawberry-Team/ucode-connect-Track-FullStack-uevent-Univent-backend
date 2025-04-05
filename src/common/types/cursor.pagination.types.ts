// src/common/types/cursor.pagination.types.ts
import { IsId } from '../validators/id.validator';

export class BaseCursor {
    @IsId(false, true)
    id: number;
}

export interface CursorPaginationResult<T, C> {
    items: T[];
    nextCursor: C | null;
    hasMore: boolean;
    total: number;
    remaining: number;
}

export interface CursorConfig<T, C extends BaseCursor> {
    cursorFields: (keyof C)[];
    entityAliases: Record<keyof C, string>;
    sortDirections?: Record<keyof C, 'ASC' | 'DESC'>;

    getFieldValue?: (item: T, field: keyof C) => any;
    fieldTypes?: Partial<Record<keyof C, 'date' | 'number' | 'string'>>;

    debug?: boolean;
    customConditionBuilder?: (
        after: C,
        config: CursorConfig<T, C>,
    ) => { conditions: string; parameters: Record<string, any> };
}
