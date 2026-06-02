import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RidePoint {
  time?: string;
  city: string;
  area?: string;
}

export type TripStatus =
  | "available"
  | "fully_booked"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "in_progress";

export interface Passenger {
  id: string;
  name: string;
  rating: number;
  trips: number;
  seats: number;
  amount: number;
  status: "confirmed" | "pending";
  avatarUri?: string | null;
}

export interface Trip {
  id: string;
  date: string;
  weekday: string;
  from: RidePoint;
  to: RidePoint;
  driverId: string;
  driverName: string;
  driverRating: number;
  driverTrips: number;
  driverAvatarUri?: string | null;
  vehicleModel: string;
  vehiclePlate: string;
  pricePerSeat: number;
  totalSeats: number;
  bookedSeats: number;
  status: TripStatus;
  cancelReason?: string;
  preferences?: string[];
  rules?: string[];
  duration?: string;
  distance?: string;
  passengers?: Passenger[];
}

interface TripState {
  trips: Trip[];
  selectedTripId?: string;
}

const sample: Trip[] = [
  {
    id: "t1",
    date: "15 May",
    weekday: "Friday",
    from: { time: "08:00", city: "Yaoundé", area: "Central Post" },
    to: { time: "11:15", city: "Douala", area: "Akwa" },
    driverId: "d1",
    driverName: "Paul N.",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Toyota Yaris",
    vehiclePlate: "CE 123 AB",
    pricePerSeat: 4500,
    totalSeats: 3,
    bookedSeats: 3,
    status: "fully_booked",
    rules: ["No smoking", "Music inside", "Air conditioning", "USB Chargers"],
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t2",
    date: "18 May",
    weekday: "Friday",
    from: { time: "10:00", city: "Yaoundé", area: "Central Post" },
    to: { time: "13:20", city: "Douala", area: "Akwa" },
    driverId: "d2",
    driverName: "Sipho Mthembu",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Toyota Yaris",
    vehiclePlate: "CE 456 CD",
    pricePerSeat: 4400,
    totalSeats: 3,
    bookedSeats: 2,
    status: "available",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t3",
    date: "20 May",
    weekday: "Wednesday",
    from: { time: "10:30", city: "Yaoundé", area: "Central Post" },
    to: { time: "13:50", city: "Douala", area: "Akwa" },
    driverId: "d3",
    driverName: "Lwazi Dlamini",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Mercedes Benz S",
    vehiclePlate: "CE 789 EF",
    pricePerSeat: 4450,
    totalSeats: 3,
    bookedSeats: 1,
    status: "available",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t4",
    date: "22 May",
    weekday: "Friday",
    from: { time: "10:30", city: "Yaoundé", area: "Central Post" },
    to: { time: "13:50", city: "Douala", area: "Akwa" },
    driverId: "d4",
    driverName: "Thulani Khumalo",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Toyota Corolla",
    vehiclePlate: "CE 321 GH",
    pricePerSeat: 4500,
    totalSeats: 3,
    bookedSeats: 0,
    status: "available",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t5",
    date: "24 May",
    weekday: "Sunday",
    from: { time: "12:00", city: "Yaoundé", area: "Central Post" },
    to: { time: "15:20", city: "Douala", area: "Akwa" },
    driverId: "d5",
    driverName: "Kwame Boateng",
    driverRating: 4.8,
    driverTrips: 96,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Hyundai i10",
    vehiclePlate: "CE 654 IJ",
    pricePerSeat: 4400,
    totalSeats: 4,
    bookedSeats: 2,
    status: "available",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t6",
    date: "25 May",
    weekday: "Monday",
    from: { time: "14:30", city: "Yaoundé", area: "Central Post" },
    to: { time: "17:50", city: "Douala", area: "Akwa" },
    driverId: "d6",
    driverName: "Daniel Mbeki",
    driverRating: 4.7,
    driverTrips: 64,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Nissan Sunny",
    vehiclePlate: "CE 987 KL",
    pricePerSeat: 4500,
    totalSeats: 3,
    bookedSeats: 1,
    status: "available",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t7",
    date: "10 May",
    weekday: "Saturday",
    from: { time: "09:00", city: "Yaoundé", area: "Central Post" },
    to: { time: "12:20", city: "Douala", area: "Akwa" },
    driverId: "d2",
    driverName: "Sipho Mthembu",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Toyota Yaris",
    vehiclePlate: "CE 456 CD",
    pricePerSeat: 4400,
    totalSeats: 3,
    bookedSeats: 3,
    status: "completed",
    rules: ["No smoking", "Music inside", "Air conditioning", "USB Chargers"],
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t8",
    date: "05 May",
    weekday: "Monday",
    from: { time: "07:30", city: "Yaoundé", area: "Central Post" },
    to: { time: "10:45", city: "Douala", area: "Akwa" },
    driverId: "d3",
    driverName: "Lwazi Dlamini",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Mercedes Benz S",
    vehiclePlate: "CE 789 EF",
    pricePerSeat: 4450,
    totalSeats: 3,
    bookedSeats: 3,
    status: "completed",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t9",
    date: "02 May",
    weekday: "Friday",
    from: { time: "16:00", city: "Bafoussam", area: "Marché A" },
    to: { time: "19:30", city: "Yaoundé", area: "Central Post" },
    driverId: "d5",
    driverName: "Kwame Boateng",
    driverRating: 4.8,
    driverTrips: 96,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Hyundai i10",
    vehiclePlate: "CE 654 IJ",
    pricePerSeat: 5000,
    totalSeats: 4,
    bookedSeats: 4,
    status: "completed",
    duration: "3h30",
    distance: "295 km",
  },
  {
    id: "t10",
    date: "28 Apr",
    weekday: "Monday",
    from: { time: "08:00", city: "Douala", area: "Bonabéri" },
    to: { time: "11:15", city: "Yaoundé", area: "Central Post" },
    driverId: "d6",
    driverName: "Daniel Mbeki",
    driverRating: 4.7,
    driverTrips: 64,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Nissan Sunny",
    vehiclePlate: "CE 987 KL",
    pricePerSeat: 4400,
    totalSeats: 3,
    bookedSeats: 2,
    status: "completed",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t11",
    date: "16 May",
    weekday: "Saturday",
    from: { time: "13:00", city: "Yaoundé", area: "Central Post" },
    to: { time: "16:20", city: "Douala", area: "Akwa" },
    driverId: "d4",
    driverName: "Thulani Khumalo",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Toyota Corolla",
    vehiclePlate: "CE 321 GH",
    pricePerSeat: 4500,
    totalSeats: 3,
    bookedSeats: 1,
    status: "cancelled",
    cancelReason: "Vehicle breakdown",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t12",
    date: "12 May",
    weekday: "Monday",
    from: { time: "09:30", city: "Yaoundé", area: "Central Post" },
    to: { time: "12:50", city: "Bafoussam", area: "Marché A" },
    driverId: "d5",
    driverName: "Kwame Boateng",
    driverRating: 4.8,
    driverTrips: 96,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Hyundai i10",
    vehiclePlate: "CE 654 IJ",
    pricePerSeat: 5000,
    totalSeats: 4,
    bookedSeats: 0,
    status: "cancelled",
    cancelReason: "Not enough passengers",
    duration: "3h20",
    distance: "295 km",
  },
  {
    id: "t13",
    date: "08 May",
    weekday: "Thursday",
    from: { time: "18:00", city: "Douala", area: "Akwa" },
    to: { time: "21:15", city: "Yaoundé", area: "Central Post" },
    driverId: "d2",
    driverName: "Sipho Mthembu",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Toyota Yaris",
    vehiclePlate: "CE 456 CD",
    pricePerSeat: 4400,
    totalSeats: 3,
    bookedSeats: 2,
    status: "cancelled",
    cancelReason: "Driver unavailable",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t14",
    date: "28 May",
    weekday: "Thursday",
    from: { time: "06:30", city: "Yaoundé", area: "Central Post" },
    to: { time: "09:45", city: "Douala", area: "Akwa" },
    driverId: "d3",
    driverName: "Lwazi Dlamini",
    driverRating: 4.9,
    driverTrips: 128,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Mercedes Benz S",
    vehiclePlate: "CE 789 EF",
    pricePerSeat: 4450,
    totalSeats: 3,
    bookedSeats: 2,
    status: "confirmed",
    duration: "4h",
    distance: "240 km",
  },
  {
    id: "t15",
    date: "30 May",
    weekday: "Saturday",
    from: { time: "11:00", city: "Yaoundé", area: "Central Post" },
    to: { time: "14:30", city: "Bafoussam", area: "Marché A" },
    driverId: "d6",
    driverName: "Daniel Mbeki",
    driverRating: 4.7,
    driverTrips: 64,
    driverAvatarUri:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces",
    vehicleModel: "Nissan Sunny",
    vehiclePlate: "CE 987 KL",
    pricePerSeat: 5000,
    totalSeats: 4,
    bookedSeats: 1,
    status: "available",
    duration: "3h30",
    distance: "295 km",
  },
];

const initialState: TripState = {
  trips: sample,
  selectedTripId: undefined,
};

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    setSelectedTripId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedTripId = action.payload;
    },
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.trips = [action.payload, ...state.trips];
    },
    updateTrip: (
      state,
      action: PayloadAction<{ id: string; data: Partial<Trip> }>,
    ) => {
      state.trips = state.trips.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload.data } : t,
      );
    },
    cancelTrip: (state, action: PayloadAction<string>) => {
      state.trips = state.trips.map((t) =>
        t.id === action.payload ? { ...t, status: "cancelled" } : t,
      );
    },
  },
});

export const { setSelectedTripId, addTrip, updateTrip, cancelTrip } =
  tripSlice.actions;
export default tripSlice.reducer;
