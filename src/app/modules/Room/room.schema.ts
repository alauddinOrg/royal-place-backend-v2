import mongoose, { Schema } from "mongoose";
import { IRoom, RoomStatus, RoomType } from "./room.interface";

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    floor: { type: Number, required: true },
    title: { type: String, default: "" },
    images: { type: [String], default: [] },
    features: { type: [String], default: [] },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: Object.values(RoomType),
      required: true,
    },
    price: { type: Number },

    // ✅ Newly added fields
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    maxOccupancy: {type: Number,  }, 

    bedType: {
      type: String,
      enum: ["king", "queen", "twin", "double", "single"], // from BedType enum
      required: true,
    },
    bedCount: { type: Number, required: true },


    roomStatus: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.Active,
    },
  },
  {
    timestamps: true,
  }
);

const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);
export default RoomModel;
