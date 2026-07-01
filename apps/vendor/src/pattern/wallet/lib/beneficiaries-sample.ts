// Mockup beneficiaries for the Select Beneficiary modal. The backend exposes no
// beneficiaries endpoint yet (not in Swagger), so this stands in until one
// exists. TODO(api): replace with GET beneficiaries.

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bank: string;
}

export const SAMPLE_BENEFICIARIES: Beneficiary[] = [
  { id: 'b1', name: 'Adeyemi Oluwatoyosi Elizabeth', accountNumber: '3116252754', bank: 'First Bank' },
  { id: 'b2', name: 'Elijah Oludele Shola', accountNumber: '1289748957', bank: 'Dozzia Bank' },
  { id: 'b3', name: 'Ayodele Dada Kain', accountNumber: '1289748957', bank: 'Dozzia Bank' },
  { id: 'b4', name: 'Adeyemi Oluwatoyosi Elizabeth', accountNumber: '3116252754', bank: 'First Bank' },
  { id: 'b5', name: 'Elijah Oludele Shola', accountNumber: '1289748957', bank: 'Dozzia Bank' },
  { id: 'b6', name: 'Ayodele Dada Kain', accountNumber: '1289748957', bank: 'Dozzia Bank' },
  { id: 'b7', name: 'Ngozi Chukwu Amara', accountNumber: '2087654321', bank: 'GTBank' },
  { id: 'b8', name: 'Tunde Bakare Ola', accountNumber: '0123456789', bank: 'Access Bank' },
];

// "Adeyemi Oluwatoyosi ..." -> "AO"
export const getBeneficiaryInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
