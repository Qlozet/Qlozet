import { getCookies, removeCookie } from "@/lib/helpers/cookies-manager";
import { Middleware } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SESSION_COOKIE_KEY } from "../../lib/constants";
import { env } from "@/env/client";

const BASE_URL = env.NEXT_PUBLIC_BASE_URL;

export const baseAPI = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            const userToken = getCookies({ key: SESSION_COOKIE_KEY });
            if (userToken) {
                headers.set("authorization", `Bearer ${userToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Product', 'Category', 'Products', 'WalletStats', 'OrderStats', 'Transaction', 'Beneficiary', 'WalletBalance', 'Bank', 'SupportTicket', 'VendorDetails', 'Warehouse', 'User', 'OrderSettings', 'ProductDetails', 'ProductReviews', 'ProductLikes', 'Order', 'Notification', 'NotificationSettings', 'DashboardMetrics', 'DashboardCharts', 'DashboardAnalytics', 'Customer', 'CustomerStats', 'Auth', 'Profile'],
    endpoints: () => ({}),
});

// Create a custom middleware to handle 401 errors
export const custom401Middleware: Middleware =
    () => (next: any) => (action: any) => {
        if (
            typeof action === "object" &&
            action !== null &&
            "type" in action &&
            "payload" in action &&
            typeof action.type === "string" &&
            action.type.endsWith("/rejected") &&
            typeof action.payload === "object" &&
            action.payload !== null &&
            "status" in action.payload &&
            action.payload.status === 401
        ) {
            console.log("Received 401 Unauthorized response");
            removeCookie(SESSION_COOKIE_KEY);
            window.location.replace("/login");
        }
        return next(action);
    };
