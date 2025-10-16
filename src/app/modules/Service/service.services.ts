import { AppError } from "../../error/appError";
import { IService } from "./service.interfacae";
import ServiceModel from "./service.schema";

// =============================================Create Service=====================================================
const crateService = async (serviceData: IService) => {
  const extistingService = await ServiceModel.findOne({
    name: serviceData.name,
  });
  if (extistingService) {
    throw new AppError("Service already exists for this room", 400);
  }

  const cratedService = await ServiceModel.create(serviceData);
  return cratedService;
};


// ===============================================Find all Services=======================================================
const getAllServices = async () => {
  const services = await ServiceModel.find({ isActive: true });
  return services;
};

// ==================================================Delete service by Id=======================================================

const deleteService = async (id: string) => {
  const extistingService = await ServiceModel.findOne({
    _id: id,
  });
  if (!extistingService) {
    throw new AppError("Service does not exist", 400);
  }

  const deleteService= await ServiceModel.deleteOne({_id:id})
  return deleteService;

};
// ===============================================Update service by Id=======================================================
const updateService = async (id: string, payload: Partial<IService>) => {
  const existingService = await ServiceModel.findById(id);

  if (!existingService) {
    throw new AppError("Service not found", 404);
  }

  const updatedService = await ServiceModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedService;
};


// ==============================export service=============================
export const serviceServices = {
  crateService,
  getAllServices,
  deleteService,
  updateService
};
