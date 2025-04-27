// src/models/events/dto/get-events.dto.ts
import { EventAggregationDto } from "./event-aggregation.dto";
import { WithPagination } from "../../../common/mixins/with-pagination.mixin";

export class GetEventsDto extends WithPagination(EventAggregationDto) {}
