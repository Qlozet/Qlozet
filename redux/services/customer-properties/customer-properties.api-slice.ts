import { baseAPI } from '@/redux/api/base-api'

interface IPayload {
    transaction: "lease" | "sale"
}

export interface IGetCustomerPropertiesResponse {
    id: number,
    property_id: number,
    property_name: string,
    property_thumbnail: string,
    address: string,
    number_of_bathrooms: number | string,
    number_of_bedrooms: number | string,
    total_sqm: number | string,
    next_payment_date: string
}

export interface IPropertiesDashboardMatrixResponse {
    total_paid: number,
    total_outstanding: number,
    total_past_due: number
}


export const customerPropertiesApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getLeasedProperties: builder.query<IGetCustomerPropertiesResponse[], IPayload>(
            {
                query: ({ transaction }) => ({
                    url: `/customer-profiles/me/properties/`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        transaction: transaction
                    }
                })
            },
        ),
        getLeasedDashboardMatrix: builder.query<IPropertiesDashboardMatrixResponse, IPayload>(
            {
                query: ({ transaction }) => ({
                    url: `/customer-profiles/me/dashboard/`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        transaction: transaction
                    }
                })
            },
        ),
    }),
})

export const { useGetLeasedPropertiesQuery, useGetLeasedDashboardMatrixQuery, useLazyGetLeasedPropertiesQuery } = customerPropertiesApiSlice
