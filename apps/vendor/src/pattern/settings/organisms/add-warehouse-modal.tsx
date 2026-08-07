// Add Warehouse Modal - Organism
// Creates a warehouse via POST /business/warehouse, or updates one via
// PUT /business/{id}/warehouse when a warehouse is passed in.
//
// Fields mirror CreateWarehouseDto exactly. Default/alternate status isn't part
// of that DTO — it's set from the table's "Set as default" action, which calls
// the dedicated activate endpoint.

import React from 'react';
import { create, useModal } from '@ebay/nice-modal-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useCreateBusinessWarehouseMutation,
  useUpdateBusinessWarehouseMutation,
  type Warehouse as BusinessWarehouse,
} from '@/redux/services/business/business.api-slice';
import { toast } from 'sonner';

const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  address: z.string().min(1, 'Warehouse address is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_phone: z.string().min(1, 'Contact phone number is required'),
  contact_email: z.string().email('Invalid email address'),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface AddWarehouseModalProps {
  /** Pass an existing warehouse to edit it; omit to create a new one. */
  warehouse?: BusinessWarehouse;
}

const FIELDS: { name: keyof WarehouseFormData; label: string }[] = [
  { name: 'name', label: 'Warehouse name' },
  { name: 'address', label: 'Warehouse address' },
  { name: 'contact_name', label: 'Contact name' },
  { name: 'contact_phone', label: 'Contact phone number' },
  { name: 'contact_email', label: 'Contact email address' },
];

export const AddWarehouseModal = create<AddWarehouseModalProps>(
  ({ warehouse }) => {
    const { visible, resolve, remove } = useModal();
    const isEditing = Boolean(warehouse?._id);

    const [createWarehouse] = useCreateBusinessWarehouseMutation();
    const [updateWarehouse] = useUpdateBusinessWarehouseMutation();

    const form = useForm<WarehouseFormData>({
      resolver: zodResolver(warehouseSchema),
      defaultValues: {
        name: warehouse?.name ?? '',
        address: warehouse?.address ?? '',
        contact_name: warehouse?.contact_name ?? '',
        contact_phone: warehouse?.contact_phone ?? '',
        contact_email: warehouse?.contact_email ?? '',
      },
    });

    const handleCloseModal = () => {
      form.reset();
      resolve({ resolved: false });
      remove();
    };

    const handleSubmit = async (data: WarehouseFormData) => {
      try {
        if (isEditing && warehouse?._id) {
          await updateWarehouse({ id: warehouse._id, data }).unwrap();
          toast.success('Warehouse updated');
        } else {
          await createWarehouse(data).unwrap();
          toast.success('Warehouse added');
        }

        form.reset();
        resolve({ resolved: true, data });
        remove();
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            `Failed to ${isEditing ? 'update' : 'add'} warehouse`
        );
      }
    };

    const submitting = form.formState.isSubmitting;

    return (
      <Dialog open={visible} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            {/* No close button here — DialogContent renders its own. */}
            <DialogTitle className="text-lg font-semibold">
              {isEditing ? 'Edit Warehouse' : 'Add New Warehouse'}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] px-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                {FIELDS.map(({ name, label }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal text-gray-900 dark:text-gray-200">
                          {label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={
                              name === 'contact_email'
                                ? 'email'
                                : name === 'contact_phone'
                                  ? 'tel'
                                  : 'text'
                            }
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className="bg-white dark:bg-muted/40 border-gray-200 dark:border-white/10 dark:text-gray-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="flex pt-4">
                  <Button
                    type="submit"
                    className="w-full text-white px-8"
                    disabled={submitting}
                  >
                    {submitting
                      ? isEditing
                        ? 'Saving...'
                        : 'Adding...'
                      : isEditing
                        ? 'Save changes'
                        : 'Add'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
