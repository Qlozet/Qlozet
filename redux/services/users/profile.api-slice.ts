import { baseAPI } from "@/redux/api/base-api";

interface IGetKinInformation {
    customer_profile?: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    city: {
        id: number;
        name: string;
    };
    state: {
        id: number;
        name: string;
    };
    country: {
        id: number;
        name: string;
    };
    local_government?: {
        id: number;
        name: string;
    };
    postal_code: string;
    gender: 'male' | 'female';
    relationship: string;
    date_of_birth: string;
}

interface IUpdateKinInformation {
    customer_profile?: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    city: number;
    state: number;
    country: number;
    local_government?: number;
    postal_code: string;
    gender: 'male' | 'female';
    relationship: string;
    date_of_birth: string;
}

interface IBusinessInformationGet {
    customer_profile?: number; 
    name: string;
    address: string;
    phone_number1: string;
    phone_number2: string | null; 
    email: string;
    country: {
        id: number;
        name: string;
    } | null; 
    state: {
        id: number;
        name: string;
    } | null; 
    city: {
        id: number;
        name: string;
    } | null; 
    postal_code: string;
    company_url: string;
    registration_number: string;
    registration_type: string;
    industry_type: string;
    years_in_business: number;
    logo_image_url: {
        id: number;
        url: string;
        media_type: string;
        access_level: string;
    } | null; 
}

interface IBusinessInformationUpdate {
    customer_profile?: number; 
    name: string;
    address: string;
    phone_number1: string;
    phone_number2: string | null; 
    email: string;
    country: number | null; 
    state: number | null; 
    city: number | null; 
    postal_code: string;
    company_url: string;
    registration_number: string;
    registration_type: string;
    industry_type: string;
    years_in_business: number;
    logo_image_url: {
        id: number;
        url: string;
        media_type: string;
        access_level: string;
    } | null; 
}

interface IEmploymentInformationGet {
    customer_profile: number;
    occupation: string;
    company_name: string;
    company_email: string;
    company_website: string;
    company_address: string;
    company_phone_number: string;
    country: {
        id: number;
        name: string;
    } | null;
    state: {
        id: number;
        name: string;
    } | null;
    city: {
        id: number;
        name: string;
    } | null;
    employment_duration: string;
    monthly_income?: string;
}

interface IEmploymentInformationUpdate {
    occupation: string;
    company_name: string;
    company_email: string;
    company_website: string;
    company_address: string;
    company_phone_number: string;
    country: number;
    state: number;
    city: number;
    employment_duration: string;
    monthly_income?: string;
}

interface IFinancingInformation {
    customer_profile?: number;
    financing: 'mortgage' | 'cash' | 'other';
    pre_approval: boolean;
    tenants_in_place: 'tenants_in_place' | 'no_tenants' | 'other' | string; 
    property_preference: 'new_builds' | 'existing' | 'both' | string;
    closing_time: 'as_soon_as_possible' | 'within_3_months' | 'within_6_months' | 'flexible' | string; 
    year_of_ownership: number;
    legal_advisor: boolean;
}

interface IGuarantorInformation {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
}
// Combine IPersonalDetails fields with top-level fields from example response
interface IGetProfileResponse {
    user: number;
    title: 'mr' | 'mrs' | 'ms'  | string;
    phone_number1: string;
    phone_number2: string | null;
    profile_img_url: {
        id: number;
        url: string;
        media_type: string;
        access_level: string;
    } | null;
    gender: 'male' | 'female' | string;
    marital_status: 'married' | 'single' | string;
    employment_status: 'gainfully_employed' | 'self_employed' | 'unemployed' | 'retired' | string;
    address: string;
    local_government: number | {id: number, name: string} | null; 
    neigborhood: number | null;
    city:{ id:number, name:string} | null;
    state:{ id:number, name:string} | null;
    country:{ id:number, name:string} | null;
    postal_code: string;
    date_of_birth: string;
    id_type: 'voters_card' | 'drivers_license' | 'international_passport' | 'national_id' | string;
    id_number: string;
    nin: string | null; 
    customer_type?: Array<'buyer' | 'renter'>;
    documents: string[] | null;
    profile_type: 'individual' | 'business';
    profile_completion_rate: {
        buyerprofile_completion_rate: number;
        renterprofile_completion_rate: number;
        profile_completion_rate: number;
    };
    profile_img: {
        id: string;
        url: string;
        media_type: string;
        access_level: string;
    } | null;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    // kin_information
    kin_information: IGetKinInformation | null;
    business_information: IBusinessInformationGet | null;
    employment_information: IEmploymentInformationGet | null;
    financing_information: IFinancingInformation | null;
    guarantor_information: IGuarantorInformation | null;
    references?: unknown[]; 
    co_lessees?: unknown[]; 
    property_preferences?: unknown[];
    is_completed: boolean;
}


interface IPersonalProfileUpdate {
    title: 'mr' | 'mrs' | 'ms'  | string;
    phone_number1?: string;
    phone_number2?: string | null;
    gender: 'male' | 'female' | string;
    marital_status: 'married' | 'single' | string;
    employment_status?: 'gainfully_employed' | 'self_employed' | 'unemployed' | 'retired' | string;
    address: string;
    local_government: number | null; 
    neigborhood?: number | null;
    city: number | null;
    state: number | null;
    country: number | null;
    postal_code: string;
    date_of_birth: string;
    id_type: 'voters_card' | 'drivers_license' | 'international_passport' | 'national_id' | string;
    id_number: string;
    nin: string | null; 
    customer_type: Array<'buyer' | 'renter'>;
    profile_type?: 'individual' | 'business';
    profile_img?: number | null;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
}

interface IUpdateProfilePayload {
    personal_details?: Partial<IPersonalProfileUpdate>;
    kin_information?: Partial<IUpdateKinInformation>;
    business_information?: Partial<IBusinessInformationUpdate>;
    employment_information?: Partial<IEmploymentInformationUpdate>;
    financing_information?: Partial<IFinancingInformation>;
    guarantor_information?: Partial<IGuarantorInformation>;
    employment_status?: string;
}

// Response type for property preferences
interface IPropertyPreferenceResponse {
    customer_profile: number;
    property_type: string;
    property_class: string,
    building_preferences: string,
    purchase_budget_min: number;
    purchase_budget_max: number;
    min_size: number;
    max_size: number;
    size_metric: string;
    no_of_bedrooms: number;
    no_of_bathrooms: number;
    no_of_floors: number;
    countries: number[];
    states: number[];
    neighborhood: number[];
    amenities: number[];
    purpose_of_purchase: 'primary_residence' | 'investment_property' | 'vacation_home' | 'short_term_rental';
}

// Request body type for adding property preferences
interface IAddPropertyPreferenceRequest extends Omit<IPropertyPreferenceResponse, 'customer_profile'> {}

const ProfileApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getProfile: builder.query<IGetProfileResponse, void>({
            query: () => ({
                url: `customer-profiles/me/`,
                method: 'GET',
            }),
            providesTags: ['profile'],
        }),
        updateProfile: builder.mutation<{ message: string }, {  payload: IUpdateProfilePayload }>({
            query: ({  payload }) => ({
                url: `customer-profiles/me/`,
                method: 'PUT',
                body: payload,
            }),
        }),
        addPropertyPreference: builder.mutation<IPropertyPreferenceResponse, { payload: IAddPropertyPreferenceRequest[] }>({
            query: ({ payload }) => ({
                url: `customer-profiles/me/add_property_preference/`,
                method: 'POST',
                body: payload,
            }),
        }),
        updatePropertyPreference: builder.mutation<IPropertyPreferenceResponse, { payload: IAddPropertyPreferenceRequest[] }>({
            query: ({ payload }) => ({
                url: `customer-profiles/me/update_property_preference/`,
                method: 'PUT',
                body: payload,
            }),
        }),
        deletePropertyPreference: builder.mutation<void, { id: number }>({
            query: ({ id }) => ({
                url: `customer-profiles/me/delete-property-preference/${id}/`,
                method: 'DELETE',
            }),
            // invalidatesTa gs: ['profile'],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useLazyGetProfileQuery,
    useUpdateProfileMutation,
    useAddPropertyPreferenceMutation,
    useDeletePropertyPreferenceMutation,
    useUpdatePropertyPreferenceMutation,
} = ProfileApiSlice;

// Export types if needed in components
export type { 
    IGetProfileResponse, 
    IPersonalProfileUpdate,
    IGetKinInformation,
    IUpdateKinInformation,
    IBusinessInformationUpdate, 
    IEmploymentInformationGet, 
    IEmploymentInformationUpdate, 
    IFinancingInformation, 
    IUpdateProfilePayload,
    IPropertyPreferenceResponse,
    IAddPropertyPreferenceRequest
};
