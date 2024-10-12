import { getRequest } from "./method";
const getVendorDetails = async () => {
  try {
    const response = await getRequest("/vendor/profile");
    return response;
  } catch (error) {
  }
};

export default getVendorDetails;
