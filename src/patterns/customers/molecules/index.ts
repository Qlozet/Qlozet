// Customers Page - Molecules
// Combination of atoms forming functional components

// Re-export common molecules used in customers
export { default as DashboardTopCard } from "../../common/molecules/DashboardTopCard";
export { default as Modal } from "../../common/molecules/Modal";
export { default as DropDown } from "../../common/molecules/DropDown";

// Customer-specific molecules
export { default as CustomerDetails } from "@/components/order/CustomerDetails";
export { default as OrderHistory } from "@/components/Customer/OrderHistory";
export { default as CustomerMobileHistory } from "@/components/Customer/CustomerHistoryTableItemMobile/CustomerHistoryMobile";