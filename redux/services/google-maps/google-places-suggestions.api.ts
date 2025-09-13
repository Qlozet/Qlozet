import { baseAPI } from "@/redux/api/base-api";

interface MatchedSubstring {
  length: number;
  offset: number;
}

interface StructuredFormatting {
  main_text: string;
  main_text_matched_substrings: MatchedSubstring[];
  secondary_text: string;
}

interface Term {
  offset: number;
  value: string;
}

export interface GooglePlacePrediction {
  description: string;
  matched_substrings: MatchedSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: StructuredFormatting;
  terms: Term[];
  types: string[];
}

interface GooglePlaceAutocompleteParams {
  input: string;
  types?: string;
  language?: string;
  key?: string;
}

interface GooglePlaceAutocompleteResponse {
  predictions: GooglePlacePrediction[];
  status: string;
}

const googlePlaceAutocompleteApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    googlePlaceAutocomplete: builder.query<
      GooglePlaceAutocompleteResponse,
      GooglePlaceAutocompleteParams
    >({
      query: ({
        input,
        types = "address", //types = (cities) or types = address
        language = "en",
        key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      }) => ({
        url: `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        params: {
          input,
          types,
          language,
          key,
        },
        method: "GET",
      }),
      providesTags: ["googlePlaceAutocomplete"],
      // transformResponse: (response: GooglePlaceAutocompleteResponse) => {
      //   // Filter to only show cities and major locations
      //   if (response.predictions) {
      //     response.predictions = response.predictions.filter(
      //       (prediction) =>
      //         prediction.types.includes("locality") ||
      //         prediction.types.includes("administrative_area_level_1") ||
      //         prediction.types.includes("country")
      //     );
      //   }
      //   return response;
      // },
    }),
  }),
});

export const {
  useGooglePlaceAutocompleteQuery,
  useLazyGooglePlaceAutocompleteQuery,
} = googlePlaceAutocompleteApiSlice;
