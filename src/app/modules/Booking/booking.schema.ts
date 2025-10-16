import mongoose, { model, Schema, Types } from "mongoose";
import { BookingStatus, IBooking } from "./booking.interface";

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    rooms: [
      {
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        checkInDate: { type: String, required: true },
        checkOutDate: { type: String, required: true },
      }
    ],

    totalAmount: { type: Number, required: true },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },

    transactionId: { type: String, unique: true },
    cancelProbability: { type: Number, default: 0 },
    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.Pending,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BookingModel = model<IBooking>("Booking", bookingSchema);

export default BookingModel;
