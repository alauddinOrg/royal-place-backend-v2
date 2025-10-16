
import BookingModel from "../Booking/booking.schema";
import mongoose from "mongoose";
import PaymentModel from "./payment.schema";
import { GetPaymentsOptions, PaymentStatus } from "./payment.interface";
import { BookingStatus } from "../Booking/booking.interface";
import sanitize from "mongo-sanitize";
import { AppError } from "../../error/appError";
import { verifyPayment } from "../../integrations/aamarpay";

// ======================================================================Payment Verify with Success======================================================================
const paymentVerify = async (transactionIdRaw: string) => {
  // sanitize input
  const transactionId = sanitize(transactionIdRaw);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Step 1: Verify with AamarPay
    const verificationResponse = await verifyPayment(transactionId);
    console.log('AamarPay verification response:', verificationResponse);

    // ✅ Step 2: Get payment record
    const payment = await PaymentModel.findOne({ transactionId }).session(session);
    if (!payment) throw new Error('Payment not found');

    // ✅ Step 3: Update status based on AamarPay response
    if (
      verificationResponse &&
      verificationResponse.pay_status === "Successful"
    ) {
      payment.status = PaymentStatus.Completed;

      // ✅ Also update booking as booked
      await BookingModel.findByIdAndUpdate(
        payment.bookingId,
        { bookingStatus: BookingStatus.Booked },
        { session }
      );
    } else {
      payment.status = PaymentStatus.Failed;
    }

    // ✅ Step 4: Save changes
    await payment.save({ session });
    await session.commitTransaction();
    session.endSession();

    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ===============================================================Payment Failed===================================================================
const paymentFail = async (transactionIdRaw: string) => {
  const transactionId = sanitize(transactionIdRaw);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Step 1: Verify with AamarPay
    const verificationResponse = await verifyPayment(transactionId);
    console.log('AamarPay verification response:', verificationResponse);

    // ✅ Step 2: Get payment record
    const payment = await PaymentModel.findOne({ transactionId }).session(session);
    if (!payment) throw new Error('Payment not found');

    // ✅ Step 3: Update status based on AamarPay response
    if (
      verificationResponse &&
      verificationResponse.pay_status === "Failed"
    ) {
      // Update payment status
      payment.status = PaymentStatus.Failed;

      // Also update booking status
      const booking = await BookingModel.findOne({ transactionId }).session(session);
      if (!booking) throw new Error('Booking not found');

      booking.bookingStatus = BookingStatus.Failed;

      // Save both documents
      await payment.save({ session });
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      return payment;
    } else {
      throw new Error("Payment is not marked as failed by AamarPay");
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ===============================================================Payment Cancel===================================================================
const paymentCancel = async (transactionIdRaw: string) => {
  const transactionId = sanitize(transactionIdRaw);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

 
      // Update booking status
      const booking = await BookingModel.findOne({ transactionId }).session(session);
      if (!booking) throw new Error('Booking not found');

      const initiateCancel=booking.bookingStatus = BookingStatus.InitiateCancel;

      // Save both documents
  
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      return initiateCancel;
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//================================get payments data====================================
const getPayments = async (options: GetPaymentsOptions) => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 && options.limit <= 100 ? options.limit : 10;
  const status = options.status?.toLowerCase() || "all";
  const searchTerm = options.searchTerm ? sanitize(options.searchTerm) : "";

  const filter: any = {};

  if (status !== "all") {
    filter.status = status;
  }

  if (searchTerm) {
    filter.$or = [
      { guest: { $regex: searchTerm, $options: "i" } },
      { transactionId: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const total = await PaymentModel.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  const data = await PaymentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    data,
    total,
    page,
    pages,
  };
};

// ================get payments data getby userId================================= 
const paymentsGetByUserId = async (userId: string) => {
  const bookings = await BookingModel.find({ userId }).select('transactionId');

  if (!bookings.length) {
    throw new AppError('No bookings found for this user.', 404);
  }

  const transactionIds = bookings.map((booking) => booking.transactionId).filter(Boolean);

  if (!transactionIds.length) {
    throw new AppError('No valid transaction IDs found from bookings.', 404);
  }

  const payments = await PaymentModel.find({
    transactionId: { $in: transactionIds },
  });

  if (!payments.length) {
    throw new AppError('No payments found for the given transactions.', 404);
  }

  return payments;
};
export const paymentServices = {
  paymentVerify,
  paymentFail,
  paymentCancel,
  getPayments, 
  paymentsGetByUserId
};