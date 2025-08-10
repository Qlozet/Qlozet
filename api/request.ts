import { getRequest } from "./method";

// Define a type for the vendor details for better type safety
interface VendorDetails {
  // Add properties of the vendor profile here, for example:
  name: string;
  id: string;
  // ... other properties
}

const getVendorDetails = async (): Promise<VendorDetails | any> => {
  try {
    const response = await getRequest("/vendor/profile");
    return response;
  } catch (error) {
    console.error("Failed to get vendor details:", error);
    return error;
  }
};

export default getVendorDetails;