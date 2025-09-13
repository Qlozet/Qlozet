import { baseAPI } from '@/redux/api/base-api'

interface IPayload {
    id: string; // User Id
}

export type GetApplicationsDetails = {
    id: number,
    status: "active" | "pending" | "rejected",
    unit_id: number,
    total_sqm: number | string,
    rent: string | number,
    number_of_bathrooms: string | number,
    number_of_bedrooms: string | number,
    garage: string | number
    property_name: string,
    address: string
    residential_commercial_type: string,
    unit_image: string,
    unit_name: string,
    rent_amount_monthly: number,
    rent_amount_yearly: number,
    number_of_rooms: number,
    property_image: string
}


export interface IGetLeaseApplicationResponse {
    active: GetApplicationsDetails[],
    pending: GetApplicationsDetails[],
    rejected: GetApplicationsDetails[],
}

interface IGetLeaseApplicationDetailsResponse {
    id: number
    move_in_date: string,
    payment_schedule: string,
    property_detail: {
        property_id: number,
        unit_id: number,
        building_id: number,
        property_name: string,
        unit_name: string,
        property_images: Array<string>,
        unit_images: Array<string>,
        address: string,
        rent_amount_monthly: number,
        rent_amount_yearly: number
        number_of_leases: number,
        service_charge_monthly: number,
        service_charge_yearly: number,
        host_info: {
            name: string,
            verified: boolean,
            profile_image: string
        },
    },
    collesee_details: {
        id: number,
        first_name: string,
        last_name: string,
        email: string,
        phone_number: string
    }[],
    employment_details: {
        company_name: string,
        company_address: string,
        company_email: string,
        company_phone_number: string,
        occupation: string,
        monthly_income: number,
        city: string,
        state: string
    },
    reference_details: {
        id: number,
        first_name: string,
        last_name: string,
        email: string,
        phone_number: string
    }[]
}


export const leaseApplicationApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        // Get Lease Applications
        getLeaseApplications: builder.query<IGetLeaseApplicationResponse, void>(
            {
                query: () => ({
                    url: `/customer-profiles/me/lease_applications/`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            },
        ),

        // Get details of a lease application
        getLeaseApplicationDetails: builder.query<IGetLeaseApplicationDetailsResponse, { id: string | number }>(
            {
                query: ({ id }) => ({
                    url: `/customer-profiles/me/lease_applications/${id}/`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            },
        )
    }),
})

export const { useGetLeaseApplicationsQuery, useGetLeaseApplicationDetailsQuery } = leaseApplicationApiSlice

