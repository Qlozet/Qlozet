import { baseAPI } from '@/redux/api/base-api'

export interface IPropertyBookAppointmentPayload {
    note: string;
    visit_datetime: string;
    property_id: string;
    unit_id?: string;
    building_id?: string;
    source_type: string;
}

export interface IBookedAppointmentsResponse {
    id: number;
    visit_code: string;
    property: number;
    property_name: string;
    building: number | null;
    unit: number;
    unit_name: string;
    customer: {
        id: number;
        name: string;
    };
    visit_datetime: string;
    notes: string;
}

export const bookAppointmentApiSlice = baseAPI.injectEndpoints({
    endpoints: builder => ({
        bookAppointment: builder.mutation<IBookedAppointmentsResponse, { payload: IPropertyBookAppointmentPayload }>({
            query: ({ payload }) => ({
                url: 'appointments/register_visit/',
                method: 'POST',
                body: payload,
            }),
        }),
    }),
})

export const { useBookAppointmentMutation } = bookAppointmentApiSlice
