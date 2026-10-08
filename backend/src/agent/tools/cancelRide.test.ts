import { cancelRideTool } from "./cancelRide.js";
import { mockRides } from "../mockData.js";

function snapshotRides(): typeof mockRides {
  return JSON.parse(JSON.stringify(mockRides));
}

describe("cancelRide", () => {
  let originalRides: typeof mockRides;

  beforeAll(() => {
    originalRides = snapshotRides();
  });

  afterEach(() => {
    Object.assign(mockRides, JSON.parse(JSON.stringify(originalRides)));
  });

  it("returns an error when the ride ID does not exist", async () => {
    const result = await cancelRideTool.execute({ rideId: "ride-unknown" });

    expect(result).toEqual({ error: "No ride found with ID 'ride-unknown'." });
  });

  it("cancels a ride with no driver assigned free of charge", async () => {
    const result = await cancelRideTool.execute({ rideId: "ride-1" });

    expect(result).toEqual({
      rideId: "ride-1",
      cancelled: true,
      feeApplied: false,
      reason: "Cancelled free of charge within the booking window.",
    });
    expect(mockRides["ride-1"].status).toBe("cancelled");
  });

  it("applies a cancellation fee when a driver is assigned and outside the free window", async () => {
    const result = await cancelRideTool.execute({ rideId: "ride-2" });

    expect(result).toEqual({
      rideId: "ride-2",
      cancelled: true,
      feeApplied: true,
      reason: "A driver was already assigned and en route; a cancellation fee applies.",
    });
  });

  it("waives the fee when the driver was more than 10 minutes late", async () => {
    const result = await cancelRideTool.execute({ rideId: "ride-3" });

    expect(result).toEqual({
      rideId: "ride-3",
      cancelled: true,
      feeApplied: false,
      reason: "Fee waived: the driver was more than 10 minutes late.",
    });
  });

  it("refuses to cancel a ride that is already in progress", async () => {
    const result = await cancelRideTool.execute({ rideId: "ride-4" });

    expect(result).toEqual({
      error:
        "This ride is already in progress and cannot be cancelled through support — it must be completed or ended by the driver.",
    });
  });

  it("refuses to cancel a ride that is already cancelled", async () => {
    await cancelRideTool.execute({ rideId: "ride-1" });
    const result = await cancelRideTool.execute({ rideId: "ride-1" });

    expect(result).toEqual({ error: "This ride is already cancelled and cannot be cancelled." });
  });
});
