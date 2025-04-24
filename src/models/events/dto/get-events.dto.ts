// src/models/events/dto/get-events.dto.ts
import { EventFilterDto } from "./event-filter.dto";
import { WithPagination } from "../../../common/mixins/with-pagination.mixin";

export class GetEventsDto extends WithPagination(EventFilterDto) {}
