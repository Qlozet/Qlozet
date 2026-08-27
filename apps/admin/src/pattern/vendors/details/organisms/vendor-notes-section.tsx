'use client';

import { NotesAndFlagsSection } from '@/pattern/common/organisms/notes-and-flags-section';
import {
  useAddVendorNoteMutation,
  useDeleteVendorNoteMutation,
  useGetVendorNotesQuery,
  useResolveVendorNoteMutation,
} from '@/redux/services/vendor-details/vendor-details.api-slice';

interface VendorNotesSectionProps {
  businessId: string;
}

/**
 * Internal notes and flags on a vendor.
 *
 * Vendor-level only: a note pinned to one of their products lives on that
 * product's page. A flag here marks the vendor across the console, which is why
 * a product flag deliberately does not.
 */
export const VendorNotesSection = ({ businessId }: VendorNotesSectionProps) => {
  const { data, isLoading } = useGetVendorNotesQuery(
    { businessId, page: 1, size: 50 },
    { skip: !businessId }
  );
  const [addNote, { isLoading: isAdding }] = useAddVendorNoteMutation();
  const [resolveNote] = useResolveVendorNoteMutation();
  const [deleteNote] = useDeleteVendorNoteMutation();

  return (
    <NotesAndFlagsSection
      notes={data?.data?.data ?? []}
      isLoading={isLoading}
      isAdding={isAdding}
      flagLabel="Flag vendor"
      flaggedMessage="Vendor flagged"
      emptyMessage="Nothing recorded about this vendor yet."
      onAdd={(body, kind) => addNote({ businessId, body, kind }).unwrap()}
      onResolve={(noteId) => resolveNote(noteId).unwrap()}
      onDelete={(noteId) => deleteNote(noteId).unwrap()}
    />
  );
};
