import { Request, Response } from "express";
import { catchAsyncHandeller } from "../../utils/handeller/catchAsyncHandeller";
import { serviceServices } from "./service.services";
import { getIO } from "../../socket";

// =============================================Create Service=====================================================
const createService = catchAsyncHandeller(
  async (req: Request, res: Response) => {

    const imageUrl = req.file?.path;

    const serviceData = {
      ...req.body,
      image: imageUrl,
      pricePerDay: Number(req.body.pricePerDay),
    };

    const service = await serviceServices.crateService(serviceData);
    // Socket event emit
    const io = getIO();
    io.to("guest").emit("service-added", service);

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  }
);


// ===============================================Find all Services=======================================================

const getAllServices = catchAsyncHandeller(
  async (req: Request, res: Response) => {

    const services = await serviceServices.getAllServices();
    res.status(200).json({
      success: true,
      message: "All services fetched successfully",
      data: services,
    });
  }
);

// ==================================================Delete service by Id=======================================================
const deleteService = catchAsyncHandeller(
  async (req: Request, res: Response) => {
    const service = await serviceServices.deleteService(req.params.id)
    console.log("delete", service)

    res.status(200).json({
      success: true,
      message: "Service delete successfully",
      data: service,
    });
  }
);
// ===============================================Update service by Id=======================================================
const updateService = catchAsyncHandeller(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const imageUrl = req.file?.path;

    const updateData = {
      ...req.body,
      pricePerDay: req.body.pricePerDay ? Number(req.body.pricePerDay) : undefined,
    };

    // If image exists, attach it
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updatedService = await serviceServices.updateService(id, updateData);

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  }
);


// ==============================export controller=============================
export const serviceController = {
  createService,
  updateService,
  getAllServices,
  deleteService
};
