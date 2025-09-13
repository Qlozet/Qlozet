import { baseAPI } from "@/redux/api/base-api";

interface ICreateBusinessPayload {
  name: string,
  email: string,
  phone_number: string,
  street_address: string,
  city: number,
  state: number,
  postal_code: string,
  company_url: string,
  company_registration_number: string,
  company_registration_type: string,
  tax_identification_number: string,
  industry_type: string,
  company_continuity: string,
  company_logo_id: string,
  profile_description: string,
  business_certificate_id: string,
  banner_image_id: string,
  proof_of_address_ids: Array<string>,
  bank_details_id: string,
  directors: {
    first_name: string,
    last_name: string,
    email: string,
    contact_details: string,
    phone_number: string
  }[]
}

interface ICreateIndividualPayload {
  city: number,
  state: number,
  street_address: string,
  date_of_birth: Date,
  notes: string,
  profile_description: string,
  id_type: string,
  id_number: string,
  governing_body_certification?: string,
  profile_image_id: number | string,
  banner_image_id: number | string,
  id_document_id: number | string,
  certification_document_ids?: Array<number | string>,
  bank_details_id: string
}

interface IGetOrganizationParams {
  organizationType?: string;
  id?: string;
  organizationData?: {
    organization_type: string
  }
}

interface IOrganizationResponse {
  organization_not_exist?: boolean;
}

const organizationApiSlice = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    createBusinessOrganization: builder.mutation<
      IOrganizationResponse,
      ICreateBusinessPayload
    >({
      query: (DTO) => ({
        url: "organization/business/",
        method: "POST",
        body: DTO,
      }),
    }),
    createIndividualOrganization: builder.mutation<
      IOrganizationResponse,
      ICreateIndividualPayload
    >({
      query: () => ({
        url: "organization/individual/",
        method: "POST",
      }),
    }),
    getOrganization: builder.query<
      IOrganizationResponse,
      IGetOrganizationParams
    >({
      query: ({ organizationType, id }) => ({
        url: `organization/${organizationType}/${id}/`,
        method: "GET",
      }),
      providesTags: ['getOrganizationDetails'],
    }),

    // Update Organization
    updateOrganization: builder.mutation<
      IOrganizationResponse,
      IGetOrganizationParams
    >({
      query: ({ organizationType, id, organizationData }) => ({
        url: `organization/${organizationType}/${id}/`,
        method: 'PUT',
        body: organizationData,
      }),
      invalidatesTags: ['getOrganizationDetails'],
    }),
  }),
});

export const {
  useCreateBusinessOrganizationMutation,
  useCreateIndividualOrganizationMutation,
  useUpdateOrganizationMutation,
  useLazyGetOrganizationQuery,
  useGetOrganizationQuery,
} = organizationApiSlice;
