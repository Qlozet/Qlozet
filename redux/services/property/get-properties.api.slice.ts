import { baseAPI } from "@/redux/api/base-api";

export interface PaginatedResponse<T> {
  count: number;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  results: T[];
}
export interface PropertyType {
  id: number,
  listing_type: string,
  property_id: number,
  unit_id: number,
  building_id: number,
  name: string,
  property_type: "residential" | "commercial | mixed_use";
  residential_type: string,
  thumbnail_url: string,
  location: string,
  price: {
    amount: number,
    currency: string,
    formatted: string
  },
  beds: number,
  baths: number,
  sqft: number,
  property_features: Array<string>,
  partner_type: string,
  partner_name: string,
  points: number | string; // Currently not being returned as part of response. Here to satisfy typescript
  numberOfUnitsLeft: number | string; // Currently not being returned as part of response. Here to satisfy typescript
  transaction_type: string
}


interface Amenity {
  id: number;
  name: string;
  amenity_type: string;
}

interface Floor {
  floor_name: string;
  total_sqm: number | null;
  units: any[]; // TODO: Define unit type if needed
}

interface Building {
  id: number;
  building_name: string;
  building_type: string;
  description: string;
  total_sqm: string;
  total_units: number;
  address: string;
  amenities: Amenity[];
  default_transaction_type: "rent" | "sale" | "short_stay";
  floors: Floor[];
}

export interface AmmenitiesProp {
  amenities:
  | {
    amenities:
    | {
      id: number;
      name: string;
      type: string;
    }
    | undefined;
    category: string;
  }
  | any;
}

export type ImageType = {
  url: string;
  id: number;
  type: string;
  media_type: string;
};
[];

export interface TransactionDetails {
  transaction_type: string;
  base_price: number;
  currency: string;
  fees: [{ name: string; amount: number; formatted: string }];
  total: number;
  total_formatted: string;
}

export type AgentDetails = {
  id: string,
  name: string,
  type: string,
  assigned_at: string
}
export interface PropertyDetailsType {
  additional_details: {
    building_type: string;
    engagement: string;
    is_in_estate: boolean;
    is_off_plan: boolean;
    is_serviced: boolean;
    land_type: string | null;
    property_id: number;
    property_status: string;
    total_units: number;
    transaction_type: {
      type: string;
      description: string;
    };
  };
  building_id: number;
  address: string;
  amenities: AmmenitiesProp | [];
  attestation: {
    type: string,
    description: string,
    verified: boolean
  }[];
  building_description: string;
  city: string;
  country: string;
  gps_latitude: number;
  gps_longitude: number;
  host: {
    name: string;
    type: string;
    verified: boolean;
    agents: AgentDetails[];
  };
  id: string;
  images: ImageType[] | undefined;
  listing_type: string;
  location: string;
  name: string;
  policies: {
    rental_rules: any;
    landlord_policy: any;
    health_safety: any;
  };
  postal_code: string;
  pricing: {
    transaction_type: string;
    currency: string;
    currency_symbol: string;
    sale_amount: number;
    sale_discount: number;
    [key: string]: any;
  };
  property_id: number;
  property_size: string;
  property_type: string;
  related_properties: {
    organization_id: string;
    transaction_type: string;
    exclude_property_id: number;
    fetch_url: string;
  };
  residential_type: string;
  state: string;
  thumbnail: string | null;
  total_sqm: number;
  transaction_type: string;
  unit_details: {
    bedrooms: number;
    bathrooms: number | null;
    max_occupants: number;
    garage: any | null;
    unit_type: string | null;
    [key: string]: any;
  };
  unit_id: number;
  vicinity: {
    location: string;
    gps_coordinates: any;
  };
  year_built: number | null;

  transaction_details: TransactionDetails;
}

interface PropertyDetailsParams {
  exclude_property_id?: number | undefined;
  organization_id?: string | undefined;
  transaction_type?: string | undefined;
  listing_id: string | null;
  listing_type: string | null;
}

const getPropertiesApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<
      PaginatedResponse<PropertyType>,
      {
        transaction_type?: string | null;
        property_type?: string | null;
        location?: string;
        beds?: number;
        baths?: number;
        building_type?: string;
        sort_by?: string;
        price_min?: number;
        price_max?: number;
        square_meters_min?: number;
        square_meters_max?: number;
        in_estate?: boolean;
        is_serviced?: boolean;
        is_off_plan?: boolean;
      }
    >({
      query: (params) => ({
        url: `property/public_properties/`,
        method: "GET",
        params: {
          transaction_type: params.transaction_type,
          property_type: params.property_type,
          location: params.location,
          beds: params.beds,
          baths: params.baths,
          building_type: params.building_type,
          sort_by: params.sort_by,
          price_min: params.price_min,
          price_max: params.price_max,
          square_meters_min: params.square_meters_max,
          square_meters_max: params.square_meters_max,
          in_estate: params.in_estate,
          is_serviced: params.is_serviced,
          is_off_plan: params.is_off_plan,
        },
      }),
      providesTags: ["getProperties"],
    }),
    //Get Property By Id
    getPropertyById: builder.query<PropertyDetailsType, PropertyDetailsParams>({
      query: ({
        exclude_property_id,
        organization_id,
        transaction_type,
        listing_id,
        listing_type, }) => ({
          url: `property/public_property_details/`,
          method: "GET",
          params: {
            exclude_property_id: exclude_property_id,
            organization_id: organization_id,
            transaction_type: transaction_type,
            listing_id: listing_id,
            listing_type: listing_type,
          },
        }),
      providesTags: ["getPropertyById"],
    }),

    // Get Related Properties
    getRelatedProperties: builder.query<
      PaginatedResponse<PropertyType>,
      PropertyDetailsParams
    >({
      query: ({
        exclude_property_id,
        organization_id,
        transaction_type,
        listing_id,
        listing_type,
      }) => ({
        url: `property/public_properties/`,
        method: "GET",
        params: {
          exclude_property_id: exclude_property_id,
          organization_id: organization_id,
          transaction_type: transaction_type,
          listing_id: listing_id,
          listing_type: listing_type,
        },
      }),
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useLazyGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useGetRelatedPropertiesQuery,
} = getPropertiesApiSlice;
