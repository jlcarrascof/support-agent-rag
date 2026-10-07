import { mockRides } from "../mockData.js";
import type { Tool } from "./types.js";

const FREE_CANCELLATION_WINDOW_MINUTES = 5;
const LATE_DRIVER_FEE_WAIVER_MINUTES = 10;

export const cancelRideTool: Tool = {
  definition: {
    type: "function",
    function: {
      name: "cancelRide",
      description: "Cancel a ride by its ride ID, applying the cancellation fee policy.",
      parameters: {
        type: "object",
        properties: {
          rideId: { type: "string", description: "The ride ID, e.g. 'ride-1'." },
        },
        required: ["rideId"],
      },
    },
  },
  async execute(args) {
    const rideId = String(args.rideId ?? "");
    const ride = mockRides[rideId];

    if (!ride) {
      return { error: `No ride found with ID '${rideId}'.` };
    }

    if (ride.status === "in_progress") {
      return {
        error:
          "This ride is already in progress and cannot be cancelled through support — it must be completed or ended by the driver.",
      };
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
      return { error: `This ride is already ${ride.status} and cannot be cancelled.` };
    }

    const withinFreeWindow =
      !ride.driverAssigned || ride.minutesSinceBooking <= FREE_CANCELLATION_WINDOW_MINUTES;
    const feeWaivedForLateDriver = ride.driverLateMinutes > LATE_DRIVER_FEE_WAIVER_MINUTES;
    const feeApplies = !withinFreeWindow && !feeWaivedForLateDriver;

    ride.status = "cancelled";

    return {
      rideId: ride.id,
      cancelled: true,
      feeApplied: feeApplies,
      reason: feeApplies
        ? "A driver was already assigned and en route; a cancellation fee applies."
        : feeWaivedForLateDriver
          ? "Fee waived: the driver was more than 10 minutes late."
          : "Cancelled free of charge within the booking window.",
    };
  },
};
