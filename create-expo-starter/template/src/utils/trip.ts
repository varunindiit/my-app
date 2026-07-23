import type { TFunction } from "i18next";
import type { TripStatus } from "../redux/slice/trip";
import type { StatusTone } from "../components/Common/StatusBadge";

/** Badge tone for each trip status — shared by TripCard and DriverTripCard. */
export const TRIP_STATUS_TONE: Record<TripStatus, StatusTone> = {
  available: "info",
  fully_booked: "warning",
  confirmed: "success",
  in_progress: "primary",
  completed: "success",
  cancelled: "danger",
};

/** Localized status label, falling back to the English literal where no key exists. */
export const tripStatusLabel = (t: TFunction, status: TripStatus): string => {
  switch (status) {
    case "confirmed":
      return t("tripStatus.confirmed");
    case "completed":
      return t("tripStatus.completed");
    case "cancelled":
      return t("tripStatus.cancelled");
    case "available":
      return t("tripStatus.available");
    case "fully_booked":
      return t("tripStatus.fullyBooked");
    case "in_progress":
      return t("tripStatus.inProgress");
    default:
      return status;
  }
};
