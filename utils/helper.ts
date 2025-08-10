import { postRequest } from "@/api/method";
import Toast from "@/components/ToastComponent/toast";
import exportFromJSON from "export-from-json";
import toast from "react-hot-toast";

export const handlerContainsNumber = (str: string): boolean => {
  const regex = /\d/;
  return regex.test(str);
};

export const handleContainsSymbolOrCharacter = (str: string): boolean => {
  const regex = /[^a-zA-Z0-9]/;
  return regex.test(str);
};

interface ValidationResult {
  status: boolean;
  data: { [key: string]: boolean };
  id?: string;
}

export const validator = (formData: { [key: string]: any }, requiredFormData: { [key: string]: any }): ValidationResult => {
  let firstErrorId: string | undefined;
  let result: ValidationResult = {
    status: true,
    data: {},
  };

  for (const key in formData) {
    if (requiredFormData.hasOwnProperty(key)) {
      if (!formData[key]) {
        if (!firstErrorId) {
          firstErrorId = key;
        }
        result = {
          status: false,
          data: { ...result.data, [key]: true },
          id: firstErrorId,
        };
      } else {
        result = {
          status: result.status,
          data: { ...result.data, [key]: false },
          id: firstErrorId,
        };
      }
    }
  }
  return result;
};

export const filterSelectedItems = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter((el) => !arr2.includes(el));
};

interface Priceable {
    price: number;
}

export const calculatePrice = (data: Priceable[]): number => {
  return data.reduce((sum, item) => sum + item.price, 0);
};

export const handleExport = (data: any[]): void => {
  const fileName = "download";
  const exportType = exportFromJSON.types.csv;
  exportFromJSON({ data, fileName, exportType });
};

interface UploadResponse {
    asset_id: string;
    public_id: string;
    secure_url: string;
}

export const uploadSingleImage = async (file: File): Promise<UploadResponse | null> => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await postRequest("/vendor/products/single-image", formData, true);
    if (response?.data?.secure_url) {
      return {
        asset_id: response.data.asset_id,
        public_id: response.data.public_id,
        secure_url: response.data.secure_url,
      };
    } else {
      toast.error("An error occurred");
      return null;
    }
  } catch (error) {
    console.error(error);
    toast.error("An error occurred");
    return null;
  }
};

type SizeMap = { [key: string]: string };

export const modifySizeHandler = (value: string): string => {
  const sizeMap: SizeMap = {
    "Extra small": "XS",
    "Small": "S",
    "Medium": "M",
    "Large": "L",
    "Extra large": "XL",
    "Extra Extra Large": "XXL",
  };
  return sizeMap[value] || "";
};

interface StatusStyle {
    name: string;
    bg: string;
    text?: string;
}

export const statusHandler = (item: { status: string }): StatusStyle => {
    switch (item.status) {
        case "out-for-delivery": return { name: "Out for delivery", bg: "#D4CFCA", text: "#3E1C01" };
        case "return": return { name: "Return", bg: "#9747FF21", text: "#A869FA" };
        case "pending": return { name: "pending", bg: "#FFF7DE", text: "#FFB020" };
        case "completed": return { name: "completed", bg: "#33CC331A", text: "#33CC33" };
        case "Successful": return { name: "Successful", bg: "#FFF5F5", text: "#33CC33" };
        default: return { name: "Return", bg: "#D4CFCA" };
    }
};

interface ProductStatus {
    text: string;
    bgColor: string;
    color: string;
}

export const activeCheck = (status: boolean): ProductStatus => {
  if (status) {
    return { text: "Active", bgColor: "#33CC331A", color: "#33CC33" };
  } else {
    return { text: "Inactive", bgColor: "#FFF5F5", color: "#FF3A3A" };
  }
};

export const customerActiveCheck = (status: string): ProductStatus => {
    if (status === "active") {
        return { text: "Active", bgColor: "#33CC331A", color: "#33CC33" };
    } else {
        return { text: "Inactive", bgColor: "#FFF5F5", color: "#FF3A3A" };
    }
};

interface WalletStatus {
    text: string;
    bgColor: string;
    color: string;
}

export const walletStatusCheck = (item: string): WalletStatus => {
    switch (item) {
        case "pending": return { text: "pending", bgColor: "#FFF7DE", color: "#FFB020" };
        case "completed": return { text: "completed", bgColor: "#33CC331A", color: "#33CC33" };
        case "successful": return { text: "Successful", bgColor: "#33CC331A", color: "#33CC33" };
        default: return { color: "Return", bgColor: "#D4CFCA", text: "Return" };
    }
};

export const getRandomHexColor = (): string => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, '0')}`;
};
