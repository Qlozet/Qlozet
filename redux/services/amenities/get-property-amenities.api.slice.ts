import { baseAPI } from "@/redux/api/base-api";

interface Amenity {
  id: number;
  name: string;
  amenity_type: string;
}

interface AmenityCategory {
  amenity_category: string;
  amenities: Amenity[];
}

type AmenityType = "commercial" | "residential";

const getPropertyAmenitiesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getPropertyAmenities: builder.query<
      AmenityCategory[],
      { amenityType: AmenityType }
    >({
      query: ({ amenityType }) => ({
        url: `property/amenities/${amenityType}/`,
        method: "GET",
      }),
      // providesTags: ["getPropertyAmenities"],
    }),
  }),
});

export const {
  useGetPropertyAmenitiesQuery,
  useLazyGetPropertyAmenitiesQuery,
} = getPropertyAmenitiesApiSlice;
