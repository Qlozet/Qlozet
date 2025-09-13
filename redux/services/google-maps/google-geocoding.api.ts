import { baseAPI } from "@/redux/api/base-api";

interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
  location_type: string;
  viewport: {
    northeast: {
      lat: number;
      lng: number;
    };
    southwest: {
      lat: number;
      lng: number;
    };
  };
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GooglePlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: Geometry;
  address_components: AddressComponent[];
  types: string[];
  name?: string;
}

interface GooglePlaceDetailsParams {
  place_id: string;
  fields?: string;
  key?: string;
}

interface GooglePlaceDetailsResponse {
  result: GooglePlaceDetails;
  status: string;
}

const googlePlaceDetailsApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    googlePlaceDetails: builder.query<
      GooglePlaceDetailsResponse,
      GooglePlaceDetailsParams
    >({
      query: ({
        place_id,
        fields = "geometry,formatted_address,address_components,types,name",
        key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      }) => ({
        url: `https://maps.googleapis.com/maps/api/place/details/json`,
        params: {
          place_id,
          fields,
          key,
        },
        method: "GET",
      }),
      providesTags: ["googlePlaceAutocomplete"],
    }),
  }),
});

export const { useGooglePlaceDetailsQuery, useLazyGooglePlaceDetailsQuery } =
  googlePlaceDetailsApiSlice;
