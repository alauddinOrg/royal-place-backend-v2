import { Application } from "express";
import { bookingRoute } from "../modules/Booking/booking.route";
import { dashboardRoute } from "../modules/Dashboard/dashboard.route";
import { paymentRoute } from "../modules/Payment/payment.route";
import { roomRoute } from "../modules/Room/room.route";
import { serviceRoute } from "../modules/Service/service.route";
import { testimonialRoute } from "../modules/Testimonials/testimonial.route";
import { userRoute } from "../modules/User/user.route";

export const routes = [
    { path: '/api/users', handler: userRoute },
    { path: '/api/rooms', handler: roomRoute },
    { path: '/api/bookings', handler: bookingRoute },
    { path: '/api/payments', handler: paymentRoute },
    { path: '/api/services', handler: serviceRoute },
    { path: '/api/testimonials', handler: testimonialRoute },
    { path: '/api/dashboards', handler: dashboardRoute },

];


export const initialRoute = (app: Application) => {
    routes.forEach(route => {
        app.use(route.path, route.handler);
    });
};