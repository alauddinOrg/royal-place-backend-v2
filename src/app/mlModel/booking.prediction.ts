// ==========================================================
// 🤖 Booking ML Feature Preparation & Prediction Module
// ----------------------------------------------------------
// This module handles preparation of machine learning features
// from booking data and calls an ML API to predict the probability
// of booking cancellation.
//
// It helps improve booking management by predicting cancellations
// and enabling proactive measures.
//
// Usage:
// - prepareMLFeatures: Extracts and computes features from booking data.
// - predictCancelProbability: Sends features to ML API and returns prediction.
//
// ==========================================================

import axios from "axios";
import BookingModel from "../modules/Booking/booking.schema";
import { calculateDaysBeforeCheckIn, calculateDuration } from "../utils/dateUtls/bookingDateUtils";
import { envVariable } from "../config";

interface MLFeatures {
  user_total_bookings: number;
  user_cancel_rate: number;
  price: number;
  duration_days: number;
  days_before_checkin: number;
  payment_completed: number;
}

// === prepareMLFeatures ======================================
// Prepares ML features based on user's booking history and
// current booking details.
// Returns an object with all necessary features for prediction.
//
// Params:
// - userId: string (MongoDB ObjectId string of the user)
// - bookingData: any (booking details, expects rooms array, paymentCompleted, totalAmount)
//
// Returns: Promise<MLFeatures>
// ============================================================
export async function prepareMLFeatures(userId: string, bookingData: any): Promise<MLFeatures> {
  const totalBookings = await BookingModel.countDocuments({ userId });
  const cancelledBookings = await BookingModel.countDocuments({ userId, bookingStatus: "cancelled" });
  const cancelRate = totalBookings > 0 ? cancelledBookings / totalBookings : 0;

  const durationDays = calculateDuration(bookingData.rooms);
  const daysBeforeCheckIn = calculateDaysBeforeCheckIn(bookingData.rooms);
  const paymentCompleted = bookingData.paymentCompleted ? 1 : 0;

  return {
    user_total_bookings: totalBookings,
    user_cancel_rate: cancelRate,
    price: bookingData.totalAmount,
    duration_days: durationDays,
    days_before_checkin: daysBeforeCheckIn,
    payment_completed: paymentCompleted,
  };
}

// === predictCancelProbability ===============================
// Calls external ML API to get cancellation probability.
//
// Params:
// - features: MLFeatures (prepared input features for prediction)
//
// Returns: Promise<number> - cancel probability between 0 and 1
//
// If API call fails, returns 0 and logs the error.
// ============================================================
export async function predictCancelProbability(features: MLFeatures): Promise<number> {
  try {
    const response = await axios.post(`${envVariable.ML_CANCEL_PREDICT_API}/predict`, features);
    return response.data.cancel_probability;
  } catch (error) {
    console.error("ML prediction failed:", error);
    return 0;
  }
}
