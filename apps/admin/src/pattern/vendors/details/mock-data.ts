// Figma placeholder data for the vendor-details tables. Used only as a visual
// fallback when the (untyped) backend returns no rows, so the page still
// reflects the design while the real endpoints fill in.

import type {
  VendorProduct,
  VendorActivity,
  VendorComplaint,
} from '@/redux/services/vendor-details/vendor-details.api-slice';

export const FALLBACK_PRODUCTS: VendorProduct[] = [
  { _id: 'p1', name: 'Amasi Queen Dress', price: 120000, category: 'Two Piece', tag: 'Women', stock: 10, variants: [{}], status: 'approved' },
  { _id: 'p2', name: 'Amasi Queen Dress', price: 120000, category: 'Two Piece', tag: 'Women', stock: 5, variants: [{}, {}], status: 'not approved' },
  { _id: 'p3', name: 'Amasi Queen Dress', price: 120000, category: 'Two Piece', tag: 'Women', stock: 10, variants: [{}], status: 'approved' },
  { _id: 'p4', name: 'Amasi Queen Dress', price: 120000, category: 'Two Piece', tag: 'Women', stock: 10, variants: [{}], status: 'approved' },
  { _id: 'p5', name: 'Amasi Queen Dress', price: 120000, category: 'Two Piece', tag: 'Women', stock: 10, variants: [{}], status: 'pending approval' },
];

export const FALLBACK_ACTIVITY: VendorActivity[] = [
  { _id: 'a1', date: '2024-05-15', user: 'Jane Smith', activityType: 'Project Funding', description: 'Funded "Clean Water Initiative"', amount: 2000, status: 'successful', remarks: 'Payment processed via bank' },
  { _id: 'a2', date: '2024-05-14', user: 'Jane Smith', activityType: 'Disbursement', description: 'Disbursed funds to beneficiary group', amount: 500, status: 'pending', remarks: 'Awaiting beneficiary confirmation' },
  { _id: 'a3', date: '2024-05-15', user: 'Jane Smith', activityType: 'Project Funding', description: 'Attempted to fund "Education Support"', amount: 1500, status: 'failed', remarks: 'Insufficient wallet balance' },
  { _id: 'a4', date: '2024-05-15', user: 'Jane Smith', activityType: 'Project Funding', description: 'Funded "Clean Water Initiative"', amount: 2000, status: 'successful', remarks: 'Payment processed via bank' },
  { _id: 'a5', date: '2024-05-15', user: 'Jane Smith', activityType: 'Project Funding', description: 'Funded "Clean Water Initiative"', amount: 2000, status: 'successful', remarks: 'Payment processed via bank' },
];

export const FALLBACK_COMPLAINTS: VendorComplaint[] = Array.from(
  { length: 5 },
  (_, i) => ({
    _id: `c${i + 1}`,
    reference: '#BD789UI2H',
    title: 'Technical Issue',
    description:
      "Amasi's dress has been shipped to 15b, Kenny street, Lagos Nigeria to Doyin Oyinkansola",
    date: 'May 25, 2023 . 12:25pm',
    status: 'pending',
  })
);
