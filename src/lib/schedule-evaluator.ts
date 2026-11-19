/**
 * Scheduled Time-Window & Active Hours Evaluator
 * Zero-dependency temporal evaluation for date ranges, active days of the week,
 * and daily operating hours (e.g., flash sales, business-hours-only links, countdown launches).
 */

export interface LinkScheduleConfig {
    startAt?: string | null; // ISO datetime string for when link opens
    endAt?: string | null; // ISO datetime string for when link closes
    activeDays?: number[] | null; // Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
    startHour?: number | null; // 0-23 UTC hour (e.g., 9 for 09:00 UTC)
    endHour?: number | null; // 0-23 UTC hour (e.g., 17 for 17:00 UTC)
    timezoneOffsetMinutes?: number | null; // Client offset in minutes if user wanted local time
}

export interface ScheduleEvaluationResult {
    isActive: boolean;
    reason?: "not_started" | "expired" | "outside_days" | "outside_hours";
    nextAvailableText?: string;
    details?: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Evaluates whether a link is currently active based on its time window and schedule.
 */
export function evaluateLinkSchedule(
    schedule?: LinkScheduleConfig | null,
    now: Date = new Date()
): ScheduleEvaluationResult {
    if (!schedule || typeof schedule !== "object") {
        return { isActive: true };
    }

    const { startAt, endAt, activeDays, startHour, endHour } = schedule;
    const nowTime = now.getTime();

    // 1. Check Start Date/Time
    if (startAt) {
        const startDate = new Date(startAt);
        const startTime = startDate.getTime();
        if (!isNaN(startTime) && nowTime < startTime) {
            return {
                isActive: false,
                reason: "not_started",
                nextAvailableText: `Opens ${startDate.toUTCString().replace(":00 GMT", " UTC")}`,
                details: "This destination link is scheduled and has not opened yet.",
            };
        }
    }

    // 2. Check End Date/Time
    if (endAt) {
        const endDate = new Date(endAt);
        const endTime = endDate.getTime();
        if (!isNaN(endTime) && nowTime > endTime) {
            return {
                isActive: false,
                reason: "expired",
                nextAvailableText: `Ended ${endDate.toUTCString().replace(":00 GMT", " UTC")}`,
                details: "The active scheduling window for this link has ended.",
            };
        }
    }

    // 3. Check Active Days of Week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    if (Array.isArray(activeDays) && activeDays.length > 0 && activeDays.length < 7) {
        const currentDay = now.getUTCDay();
        if (!activeDays.includes(currentDay)) {
            const activeDayNames = activeDays.map((d) => DAY_NAMES[d] || `Day ${d}`).join(", ");
            return {
                isActive: false,
                reason: "outside_days",
                nextAvailableText: `Active only on: ${activeDayNames}`,
                details: "This link is configured to operate only on specific days of the week.",
            };
        }
    }

    // 4. Check Daily Operating Hours (0 - 23 UTC)
    const hasStartHour = typeof startHour === "number" && !isNaN(startHour) && startHour >= 0 && startHour <= 23;
    const hasEndHour = typeof endHour === "number" && !isNaN(endHour) && endHour >= 0 && endHour <= 23;

    if (hasStartHour && hasEndHour && startHour !== endHour) {
        const currentUtcHour = now.getUTCHours();

        let isWithinHours = false;
        if (startHour < endHour) {
            // Normal range, e.g. 9 to 17 (9:00 to 17:00)
            isWithinHours = currentUtcHour >= startHour && currentUtcHour < endHour;
        } else {
            // Overnight wrap-around range, e.g. 22 to 4 (22:00 to 04:00)
            isWithinHours = currentUtcHour >= startHour || currentUtcHour < endHour;
        }

        if (!isWithinHours) {
            const pad = (n: number) => n.toString().padStart(2, "0");
            return {
                isActive: false,
                reason: "outside_hours",
                nextAvailableText: `Operating hours: ${pad(startHour)}:00 - ${pad(endHour)}:00 UTC`,
                details: "This link is currently offline outside its daily scheduled hours.",
            };
        }
    }

    // All schedule checks passed
    return { isActive: true };
}
