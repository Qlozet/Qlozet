import { baseAPI } from '@/redux/api/base-api'

export type WorkOrderHistory = {
    name: string;
    date: string;
    category: string;
    priority: string;
    location: string;
    status: string;
}

export interface IGetWorkOrderHistoryResponse {
    error: boolean
    responseCode: string
    responseMessage: string
    data: WorkOrderHistory[]
}

export const getWorkOrderHistoryApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getDocuments: builder.query<IGetWorkOrderHistoryResponse, void>(
            {
                query: () => ({
                    url: `get-documents`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            },
        ),
    }),
})

export const { useGetDocumentsQuery, useLazyGetDocumentsQuery } = getWorkOrderHistoryApiSlice
