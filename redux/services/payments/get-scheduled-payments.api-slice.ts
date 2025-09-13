import { baseAPI } from '@/redux/api/base-api'

export type ScheduledPayments = {
    transactionId: string;
    dueDate: string;
    amountCollected: string | number;
    totalDue: string | number;
}

export interface IScheduledPaymentsResponse {
    error: boolean
    responseCode: string
    responseMessage: string
    data: ScheduledPayments[]
}

export const getScheduledPaymentsApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getScheduledPayments: builder.query<IScheduledPaymentsResponse, void>(
            {
                query: () => ({
                    url: `scheduled-payment`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            },
        ),
    }),
})

export const { useGetScheduledPaymentsQuery, useLazyGetScheduledPaymentsQuery } = getScheduledPaymentsApiSlice
