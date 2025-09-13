import { baseAPI } from "@/redux/api/base-api";

// Interfaces are examples
interface IResponse {
    "user": 0,
    "title": "mr",
    "profile_img": "string",
    "gender": "male",
    "marital_status": "married",
    "employment_status": "gainfully_employed",
    "address": "string",
    "email": "string",
    "phone_number": "string",
    "local_government": 0,
    "neigborhood": 0,
    "city": 0,
    "state": 0,
    "postal_code": "string",
    "date_of_birth": "2025-03-20",
    "id_type": "voters_card",
    "id_number": "string",
    "nin": "string",
    "customer_type": [
        "buyer"
    ],
    "documents": [
        "string"
    ],
    "profile_type": "individual",
    "kin_information": {
        "customer_profile": 0,
        "email": "user@example.com",
        "first_name": "string",
        "last_name": "string",
        "phone_number": "string",
        "address": "string",
        "city": 0,
        "state": 0,
        "country": 0,
        "postal_code": "string",
        "gender": "male",
        "relationship": "spouse",
        "date_of_birth": "2025-03-20"
    },
    "business_information": {
        "customer_profile": 0,
        "name": "string",
        "address": "string",
        "phone_number1": "string",
        "phone_number2": "string",
        "email": "user@example.com",
        "country": 0,
        "state": 0,
        "city": 0,
        "postal_code": "string",
        "company_url": "string",
        "registration_number": "string",
        "registration_type": "string",
        "industry_type": "string",
        "years_in_business": 32767,
        "logo": "string"
    },
    "employment_information": {
        "customer_profile": 0,
        "occupation": "string",
        "company_name": "string",
        "company_email": "user@example.com",
        "company_website": "string",
        "company_address": "string",
        "company_phone_number": "string",
        "country": 0,
        "state": 0,
        "city": 0,
        "employment_duration": 2147483647
    },
    "financing_information": {
        "customer_profile": 0,
        "financing": "mortgage",
        "pre_approval": true,
        "tenants_in_place": "tenants_in_place",
        "property_preference": "new_builds",
        "closing_time": "as_soon_as_possible",
        "year_of_ownership": 2147483647,
        "legal_advisor": true
    },
    "references": [
        {
            "customer_profile": 0,
            "first_name": "string",
            "last_name": "string",
            "email": "user@example.com",
            "phone_number": "string"
        }
    ],
    "co_lessees": [
        {
            "customer_profile": 0,
            "first_name": "string",
            "last_name": "string",
            "email": "user@example.com",
            "phone_number": "string"
        }
    ]
}

/**
 * @deprecated use useGetProfileQuery instead

 */
const getCustomerDetailsApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getCustomerDetails: builder.query<IResponse, void>({
            query: () => ({
                url: 'users/customers-profiles/',
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetCustomerDetailsQuery,
} = getCustomerDetailsApiSlice;
