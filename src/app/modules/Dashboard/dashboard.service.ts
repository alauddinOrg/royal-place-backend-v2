import BookingModel from "../Booking/booking.schema";
import RoomModel from "../Room/room.schema";
import { BookingStatus } from "../Booking/booking.interface";
import dayjs from "dayjs";
import { Types } from "mongoose";

// ===== Admin Overview =====

const getAdminOverview = async () => {
  const todayStart = dayjs().startOf("day").toDate();
  const monthStart = dayjs().startOf("month").toDate();
  const yearStart = dayjs().startOf("year").toDate();

  /** 📌 Basic Counts **/
  const totalBookings = await BookingModel.countDocuments();
  const todaysBookings = await BookingModel.countDocuments({ createdAt: { $gte: todayStart } });
  const monthlyBookings = await BookingModel.countDocuments({ createdAt: { $gte: monthStart } });
  const yearlyBookings = await BookingModel.countDocuments({ createdAt: { $gte: yearStart } });

  /** 📌 Revenue (Total, Monthly, Today) **/
  const getRevenue = async (filter: object) => {
    const agg = await BookingModel.aggregate([
      { $match: { bookingStatus: BookingStatus.Booked, ...filter } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    return agg[0]?.total || 0;
  };

  const totalRevenue = await getRevenue({});
  const monthlyRevenue = await getRevenue({ createdAt: { $gte: monthStart } });
  const todaysRevenue = await getRevenue({ createdAt: { $gte: todayStart } });

  /** 📌 Average Booking Value **/
  const avgBookingValue = totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : "0";

  /** 📌 Booking Status Breakdown **/
  const bookingStatusBreakdown = await BookingModel.aggregate([
    { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
  ]);

  /** 📌 Room Type Popularity **/
  const roomTypePopularity = await BookingModel.aggregate([
    { $unwind: "$rooms" },
    {
      $lookup: {
        from: "rooms",
        localField: "rooms.roomId",
        foreignField: "_id",
        as: "roomData",
      },
    },
    { $unwind: "$roomData" },
    { $group: { _id: "$roomData.category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  /** 📌 Occupancy Rate **/
  const totalRooms = await RoomModel.countDocuments();
  const occupiedRooms = await RoomModel.countDocuments({ status: "occupied" });
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : "0";

  /** 📌 Available Rooms by Category **/
  const availableRoomsByCategory = await RoomModel.aggregate([
    { $match: { status: "available" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  /** 📌 Repeat vs New Customers **/
  const userBookingCounts = await BookingModel.aggregate([
    { $group: { _id: "$userId", bookings: { $sum: 1 } } },
  ]);
  const repeatCustomers = userBookingCounts.filter((u) => u.bookings > 1).length;
  const newCustomers = userBookingCounts.filter((u) => u.bookings === 1).length;

  /** 📌 Top Customers **/
  const topCustomers = await BookingModel.aggregate([
    { $match: { bookingStatus: BookingStatus.Booked } },
    { $group: { _id: "$userId", totalSpent: { $sum: "$totalAmount" }, bookings: { $sum: 1 } } },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    { $project: { name: "$userInfo.name", email: "$userInfo.email", totalSpent: 1, bookings: 1 } },
  ]);

  /** 📌 Recent Bookings **/
  const recentBookings = await BookingModel.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("userId rooms bookingStatus totalAmount transactionId createdAt")
    .populate("userId", "name email")
    .lean();

  /** 📌 Final Return **/
  return {
    role: "admin",
    stats: {
      totalBookings,
      todaysBookings,
      monthlyBookings,
      yearlyBookings,
      totalRevenue,
      monthlyRevenue,
      todaysRevenue,
      avgBookingValue,
      occupancyRate: `${occupancyRate}%`,
      repeatCustomers,
      newCustomers,
    },
    bookingStatusBreakdown,
    roomTypePopularity,
    availableRoomsByCategory,
    topCustomers,
    recentBookings,
  };
};



// ===== Receptionist Overview =====
const getReceptionistOverview = async () => {
  const today = dayjs().startOf("day").toDate();
  const todaysBookings = await BookingModel.countDocuments({ createdAt: { $gte: today } });
  const checkedInGuests = await BookingModel.countDocuments({ bookingStatus: BookingStatus.Booked });
  const availableRooms = await RoomModel.countDocuments({ status: "available" });

  const stats = [
    { title: "Today's Bookings", value: todaysBookings.toString(), change: "+5%", icon: "Calendar", color: "text-amber-400" },
    { title: "Checked-in Guests", value: checkedInGuests.toString(), change: "+10%", icon: "Users", color: "text-purple-400" },
    { title: "Available Rooms", value: availableRooms.toString(), change: "-5%", icon: "Bed", color: "text-emerald-400" },
  ];

  const recentBookings = await BookingModel.find({
    bookingStatus: { $in: [BookingStatus.Booked, BookingStatus.Pending] },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("userId rooms bookingStatus totalAmount transactionId")
    .populate("userId", "name email")
    .lean();

  return { role: "receptionist", stats, recentBookings };
};



export const getGuestOverview = async (userId: string) => {
  const today = new Date();
  const objectId = new Types.ObjectId(userId);

  // ✅ Count bookings by status
  const totalPaidBookings = await BookingModel.countDocuments({
    userId: objectId,
    bookingStatus: BookingStatus.Booked,
  });

  const totalCancelBookings = await BookingModel.countDocuments({
    userId: objectId,
    bookingStatus: BookingStatus.Cancelled,
  });

  const totalPendingBookings = await BookingModel.countDocuments({
    userId: objectId,
    bookingStatus: BookingStatus.Pending,
  });

  // ✅ 3. Sum total paid amounts using aggregation
  const totalPaidAmountAgg = await BookingModel.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        bookingStatus: BookingStatus.Booked || "Booked",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);
  const totalPaidAmount = totalPaidAmountAgg?.[0]?.totalAmount || 0;

  // ✅ 4. Get latest 5 recent bookings excluding "InitiateCancel"
  const recentBookings = await BookingModel.find({
    userId: new Types.ObjectId(userId),
    bookingStatus: { $ne: "InitiateCancel" },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("rooms totalAmount transactionId bookingStatus createdAt checkOutDate")
    .populate("rooms.roomId", "title")
    .lean();

  // ✅ 5. Get past bookings (checkout before today), excluding "InitiateCancel"
  const pastBookings = await BookingModel.find({
    userId: new Types.ObjectId(userId),
    bookingStatus: { $ne: "InitiateCancel" },
    "rooms.checkOutDate": { $lt: today },
  })
    .sort({ "rooms.checkOutDate": -1 })
    .limit(5)
    .select("rooms totalAmount transactionId bookingStatus checkOutDate")
    .populate("rooms.roomId", "title")
    .lean();


  // ✅ 6. Prepare dashboard stats
  const stats = [
    {
      title: "Total Paid Amount",
      value: `$${totalPaidAmount}`,
    },
    {
      title: "Total Paid Bookings",
      value: totalPaidBookings.toString(),
    },

    {
      title: "Total Pending Bookings",
      value: totalPendingBookings.toString(),
    },
    {
      title: "Total Cancel Bookings",
      value: totalCancelBookings.toString(),
    },

  ];

  // ✅ 7. Return overview object
  return {
    role: "guest",
    stats,
    recentBookings,
    pastBookings,
  };
};


export default getGuestOverview;





// ===== Main dispatcher function =====
export const dashboardOverviewByRole = async (role: string, userId?: string) => {
  switch (role) {
    case "admin":
      return getAdminOverview();
    case "receptionist":
      return getReceptionistOverview();
    case "guest":
      if (!userId) return { stats: [], recentBookings: [] };
      return getGuestOverview(userId);
    default:
      return { stats: [], recentBookings: [] };
  }
};




// ===== Export final dashboard service =====
export const dashboardService = {

  dashboardOverviewByRole,
};
