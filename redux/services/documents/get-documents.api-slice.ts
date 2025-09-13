import { baseAPI } from '@/redux/api/base-api'

export type Documents = {
    name: string;
    property: string;
    size: string;
}

export interface IGetDocumentsResponse {
    error: boolean
    responseCode: string
    responseMessage: string
    data: Documents[]
}

export const getDocumentsApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        getDocuments: builder.query<IGetDocumentsResponse, void>(
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

export const { useGetDocumentsQuery, useLazyGetDocumentsQuery } = getDocumentsApiSlice
