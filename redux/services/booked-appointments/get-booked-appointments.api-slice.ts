import { baseAPI } from '@/redux/api/base-api'

export type BookedAppointments = {
    count: number
}

export interface IBookedAppointmentsResponse {
    error: boolean
    responseCode: string
    responseMessage: string
    data: BookedAppointments
}

export const getBookedAppointmentsApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getBookedAppointments: builder.query<IBookedAppointmentsResponse, void>(
            {
                query: () => ({
                    url: `booked-appointments`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            },
        ),
    }),
})

export const { useGetBookedAppointmentsQuery, useLazyGetBookedAppointmentsQuery } = getBookedAppointmentsApiSlice
