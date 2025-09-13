// Dashboard Page - Organisms
// Complex components composed of molecules and atoms

// Dashboard-specific organisms
export { default as RecentOrder } from "@/components/RecentOrder";

// Organism: Top Cards Section (composition of multiple DashboardTopCard molecules)
export const TopCardsSection: React.FC<{
  totalOrder: string;
  topEarning: string;
  totalCustomer: string;
  totalReturn: string;
}> = ({ totalOrder, topEarning, totalCustomer, totalReturn }) => {
  return (
    <div className="scrollbar-hide flex items-center gap-4 overflow-x-scroll px-4 bg-transparent py-2">
      {/* This would contain the composition of DashboardTopCard molecules */}
    </div>
  );
};