import RoomModel from "./room.schema";
import { AppError } from "../../error/appError";
import { IRoom } from "./room.interface";
import sanitize from "mongo-sanitize";
import BookingModel from "../Booking/booking.schema";

//================================================Create new room=========================================
const createRoom = async (roomData: IRoom) => {
  const cleanData = sanitize(roomData);  // sanitize body data

  const isRoomExist = await RoomModel.findOne({ roomNumber: cleanData.roomNumber });

  if (isRoomExist) {
    throw new AppError("Room with this number already exists!", 409);
  }

  const newRoom = {
    roomNumber: cleanData.roomNumber,
    floor: cleanData.floor,
    title: cleanData.title,
    description: cleanData.description,
    type: cleanData.type,
    bedType: cleanData.bedType,
    bedCount: cleanData?.bedCount,
    maxOccupancy: cleanData?.adults + cleanData?.children, // calculate max occupancy
    price: cleanData.price,
    adults: cleanData.adults,
    children: cleanData.children,
    features: cleanData.features,
    images: cleanData.images,
  };
  console.log(newRoom);

  const result = await RoomModel.create(newRoom);
  return result;
};

//=================================================== Get all active rooms=============================================
const getAllRooms = async () => {
  return RoomModel.find({ roomStatus: "active" });
};

// =================================================filter Room============================================================
const filterRooms = async (queryParams: any) => {
  const cleanQuery = sanitize(queryParams);
  const {
    searchTerm,
    type,
    currentPrice,
    checkInDate,
    checkOutDate,
    adults,
    children,
    page = 1,
    limit = 10,
  } = cleanQuery;

  const skip = (Number(page) - 1) * Number(limit);
  const filters: any = {};

  // Type filter
  if (type) {
    const typeArr = type.split(",").map((s: string) => s.trim().toLowerCase());
    filters.type = { $in: typeArr };
  }

  // Search term
  if (searchTerm) {
    filters.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { type: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Price filter
  if (currentPrice) {
    const [min, max] = currentPrice.split("-").map(Number);
    filters.price = {
      ...(min && { $gte: min }),
      ...(max && { $lte: max }),
    };
  }

  // Guest count filter
  const totalGuests = Number(adults || 0) + Number(children || 0);
  if (totalGuests > 0) {
    filters.maxOccupancy = { $gte: totalGuests };
  }

  // Base room query (only active rooms)
  const baseRooms = await RoomModel.find({
    ...filters,
    roomStatus: "active",
  });

  // If no check-in/check-out dates, return base rooms with pagination
  if (!checkInDate || !checkOutDate) {
    const paginatedRooms = baseRooms.slice(skip, skip + Number(limit));
    return {
      meta: {
        total: baseRooms.length,
        page: Number(page),
        limit: Number(limit),
      },
      data: paginatedRooms,
    };
  }

  // Parse dates
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  // Helper function: check room availability for a date range
  const getAvailableRoomsByDate = async (rooms: typeof baseRooms, dateStart: Date, dateEnd: Date) => {
    const available: typeof baseRooms = [];

    for (const room of rooms) {
      const conflict = await BookingModel.findOne({
        "rooms.roomId": room._id,
        $or: [
          {
            "rooms.checkInDate": { $lt: dateEnd, $gte: dateStart },
          },
          {
            "rooms.checkOutDate": { $gt: dateStart, $lte: dateEnd },
          },
          {
            "rooms.checkInDate": { $lte: dateStart },
            "rooms.checkOutDate": { $gte: dateEnd },
          },
        ],
      });

      if (!conflict) {
        available.push(room);
      }
    }

    return available;
  };

  // Get rooms available for user's requested dates
  const availableRooms = await getAvailableRoomsByDate(baseRooms, checkIn, checkOut);


  // Calculate date ranges for suggestions

  const afterStart = new Date(checkOut);
  afterStart.setDate(afterStart.getDate() + 1);

  const afterEnd = new Date(afterStart);
  afterEnd.setDate(afterStart.getDate() + 7);  // 7 দিন পর

  const availableAfterRooms = await getAvailableRoomsByDate(baseRooms, afterStart, afterEnd);

  // Paginate availableRooms for user's requested dates
  const paginatedAvailableRooms = availableRooms.slice(skip, skip + Number(limit));

  return {
    meta: {
      total: availableRooms.length,
      page: Number(page),
      limit: Number(limit),
    },
    data: paginatedAvailableRooms,
    suggestions: {


      dateRange: [afterStart.toISOString().split("T")[0], afterEnd.toISOString().split("T")[0]],
      rooms: availableAfterRooms,

    },
  };
};


// ===========================================Get a room by ID=========================================================
const getRoomById = async (id: string) => {
  const cleanId = sanitize(id); // sanitize id param

  const room = await RoomModel.findById(cleanId);

  if (!room) throw new AppError("Room not found!", 404);
  return room;
};

// ==================================Update room details============================================================
const updateRoom = async (id: string, data: Partial<IRoom>) => {
  const cleanId = sanitize(id);
  const cleanData = sanitize(data); // sanitize update data

  const updatedRoom = await RoomModel.findByIdAndUpdate(cleanId, cleanData, { new: true });
  if (!updatedRoom) throw new AppError("Failed to update room. Not found!", 404);
  return updatedRoom;
};

// =======================================Delete room (hard delete)============================================
const deleteRoom = async (id: string) => {
  const cleanId = sanitize(id);

  const deleted = await RoomModel.findByIdAndDelete(cleanId);
  if (!deleted) throw new AppError("Failed to delete room. Not found!", 404);
  return deleted;
};




export const roomService = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  filterRooms,

};
