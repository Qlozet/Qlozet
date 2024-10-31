import { getRequest } from "./method";
const getVendorDetails = async () => {
  try {
    const response = await getRequest("/vendor/profile");
    return response;
  } catch (error) {
    return error
  }
};

export default getVendorDetails;
