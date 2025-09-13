import { SESSION_COOKIE_KEY } from "@/lib/constants";
import { getCookies, removeCookie } from "@/lib/helpers/cookies-manager";
import { Middleware } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.NEXT_PUBLIC_OOLOM_API_BASE_URL;

export const baseAPI = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const userToken = getCookies({ key: SESSION_COOKIE_KEY });
      if (userToken) {
        headers.set("authorization", `Bearer ${userToken}`);
        // headers.set("Access-Control-Allow-Origin", "*");
        // headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        // headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      }
      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "getCountries",
    "getUserByEmail",
    "getCountryStates",
    "getStatesCities",
    "getCoutriesBySearch",
    "getCountryStatesBySearch",
    "getStateCitiesBySearch",
    "getMyAccountDetails",
    "getLocalGovernment",
    "getOrganizationDetails",
    "profile",
    "getProperties",
    "getPropertyById",
    "listAppointments",
  ],
  endpoints: () => ({}),
});

// Create a custom middleware to handle 401 errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
