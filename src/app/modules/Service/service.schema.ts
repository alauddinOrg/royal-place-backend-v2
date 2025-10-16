import { model, Schema } from "mongoose";
import { IService } from "./service.interfacae";

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, default: "" },
    pricePerDay: { type: Number, required: true },
    isServiceFree: { type: Boolean, default: false },
    isActive:{type:Boolean, default:true}
  },
  {
    timestamps: true,
  }
);

const ServiceModel = model<IService>("Service", serviceSchema);
export default ServiceModel;
