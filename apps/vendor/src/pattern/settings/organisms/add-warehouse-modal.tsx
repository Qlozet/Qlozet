// Add Warehouse Modal - Organism
// Modal for adding a new warehouse with form validation

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const warehouseSchema = z.object({
  warehouseName: z.string().min(1, 'Warehouse name is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  warehouseAddress: z.string().min(1, 'Warehouse address is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhoneNumber: z.string().min(1, 'Contact phone number is required'),
  contactEmail: z.string().email('Invalid email address'),
  status: z.enum(['default', 'alternate']),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface AddWarehouseModalProps {
  onWarehouseAdded?: () => void;
}

export const AddWarehouseModal = create<AddWarehouseModalProps>(
  ({ onWarehouseAdded }) => {
    const { visible, resolve, remove } = useModal();

    const form = useForm<WarehouseFormData>({
      resolver: zodResolver(warehouseSchema),
      defaultValues: {
        warehouseName: '',
        vendorName: '',
        warehouseAddress: '',
        contactName: '',
        contactPhoneNumber: '',
        contactEmail: '',
        status: 'alternate',
      },
    });

    const handleCloseModal = () => {
      form.reset();
      resolve({ resolved: false });
      remove();
    };

    const handleSubmit = async (data: WarehouseFormData) => {
      try {
        // TODO: Integrate with actual API
        console.log('Warehouse data:', data);

        toast.success('Warehouse added successfully');
        onWarehouseAdded?.();

        form.reset();
        resolve({ resolved: true, data });
        remove();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to add warehouse');
      }
    };

    return (
      <Dialog open={visible} onOpenChange={handleCloseModal}>
        <DialogContent className='max-w-md max-h-[90vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-lg font-semibold'>
                Add new warehouse
              </DialogTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCloseModal}
                className='h-8 w-8 p-0 rounded-full'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </DialogHeader>

          <div className='overflow-y-auto max-h-[70vh] px-1'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-4'
              >
                {/* Warehouse name */}
                <FormField
                  control={form.control}
                  name='warehouseName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal text-gray-900'>
                        Warehouse name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter warehouse name'
                          className='bg-white border-gray-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vendor name */}
                <FormField
                  control={form.control}
                  name='vendorName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal text-gray-900'>
                        Vendor name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter vendor name'
                          className='bg-white border-gray-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Warehouse address */}
                <FormField
                  control={form.control}
                  name='warehouseAddress'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal text-gray-900'>
                        Warehouse address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter warehouse address'
                          className='bg-white border-gray-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact name */}
                <FormField
                  control={form.control}
                  name='contactName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal text-gray-900'>
                        Contact name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter contact name'
                          className='bg-white border-gray-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact phone number */}
                <FormField
                  control={form.control}
                  name='contactPhoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal text-gray-900'>
                        Contact phone number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter contact phone number'
                          className='bg-white border-gray-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact email address */}
                <FormField
                  control={form.control}
                  name='contactEmail'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal text-gray-900'>
                        Contact email address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Enter contact email address'
                          className='bg-white border-gray-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Set warehouse status */}
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-normal text-gray-900'>
                        Set warehouse status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='bg-white border-gray-200'>
                            <SelectValue placeholder='Select an option' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='default'>
                            Default warehouse
                          </SelectItem>
                          <SelectItem value='alternate'>
                            Alternate warehouse
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className='flex justify-end pt-4'>
                  <Button
                    type='submit'
                    className='bg-[#5C2D0D] hover:bg-[#4A2409] text-white px-8'
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Adding...' : 'Add'}
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
