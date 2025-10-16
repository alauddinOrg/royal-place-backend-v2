import { Types } from "mongoose";

export enum BookingStatus {
  Pending = "pending",
  Booked = "booked",
  Cancelled = "cancelled",
  InitiateCancel="InitiateCancel",
  Failed = "failed",
}






export interface IBookingRooms {
  roomId: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  price: number;

}


export interface IBooking {
  userId: Types.ObjectId;
  rooms: IBookingRooms[]
  totalAmount: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  bookingStatus: BookingStatus;
  transactionId?: string;
  cancelProbability?: number;
}
