"use client";

import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Upload, FileText } from 'lucide-react';

export interface DocumentsData {
  businessLogo?: FileList;
  businessDocuments?: FileList;
}

interface SignupStepDocumentsProps {
  control: Control<any>;
  className?: string;
}

export const SignupStepDocuments: React.FC<SignupStepDocumentsProps> = ({
  control,
  className = '',
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Business Documents</h2>
        <p className="text-muted-foreground">Upload your business logo and verification documents</p>
      </div>

      <FormField
        control={control}
        name="businessLogo"
        render={({ field: { onChange, name } }) => (
          <FormItem>
            <FormLabel>Business Logo</FormLabel>
            <FormControl>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload your business logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  className="mt-4"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="businessDocuments"
        render={({ field: { onChange, name } }) => (
          <FormItem>
            <FormLabel>Business Documents</FormLabel>
            <FormControl>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload verification documents</p>
                  <p className="text-xs text-muted-foreground">CAC documents, Tax ID, etc. (PDF, JPG, PNG)</p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => onChange(e.target.files)}
                  className="mt-4"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};