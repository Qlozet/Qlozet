'use client';

import { NotesAndFlagsSection } from '@/pattern/common/organisms/notes-and-flags-section';
import {
  useAddProductNoteMutation,
  useGetProductNotesQuery,
} from '@/redux/services/products/admin-products.api-slice';
import {
  useDeleteVendorNoteMutation,
  useResolveVendorNoteMutation,
} from '@/redux/services/vendor-details/vendor-details.api-slice';

interface ProductNotesSectionProps {
  productId: string;
}

/**
 * Internal notes and flags on one listing.
 *
 * The same record as a vendor note with the product set, so clearing and
 * deleting reuse the vendor-note mutations — those routes take a note id and
 * do not care what the note is about.
 *
 * Flagging a product deliberately does NOT mark its vendor flagged across the
 * console: one bad listing is not a concern about the whole business.
 */
export const ProductNotesSection = ({
  productId,
}: ProductNotesSectionProps) => {
  const { data, isLoading } = useGetProductNotesQuery(
    { productId, page: 1, size: 50 },
    { skip: !productId }
  );
  const [addNote, { isLoading: isAdding }] = useAddProductNoteMutation();
  const [resolveNote] = useResolveVendorNoteMutation();
  const [deleteNote] = useDeleteVendorNoteMutation();

  return (
    <NotesAndFlagsSection
      notes={data?.data?.data ?? []}
      isLoading={isLoading}
      isAdding={isAdding}
      flagLabel="Flag product"
      flaggedMessage="Product flagged"
      emptyMessage="Nothing recorded about this product yet."
      placeholder="Add a note, or describe what's wrong with this listing…"
      onAdd={(body, kind) => addNote({ productId, body, kind }).unwrap()}
      onResolve={(noteId) => resolveNote(noteId).unwrap()}
      onDelete={(noteId) => deleteNote(noteId).unwrap()}
    />
  );
};
