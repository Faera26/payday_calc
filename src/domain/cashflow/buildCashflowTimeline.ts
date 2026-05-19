import type { CashflowEvent, CashflowTimelineItem } from "./cashflowTypes";

export const buildCashflowTimeline = (
  events: CashflowEvent[],
): CashflowTimelineItem[] =>
  events
    .map((event) => ({
      ...event,
      timestamp: new Date(event.occurredAt).getTime(),
    }))
    .sort((left, right) => {
      if (left.timestamp !== right.timestamp) {
        return left.timestamp - right.timestamp;
      }

      return left.direction === "expense" ? -1 : 1;
    });
