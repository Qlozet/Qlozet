import { postRequest } from "@/api/method";
import exportFromJSON from "export-from-json";

export const handlerContainsNumber = (str) => {
  const regex = /\d/;
  return regex.test(str);
};

export const handleContainsSymbolOrCharacter = (str) => {
  const regex = /[^a-zA-Z0-9]/;
  return regex.test(str);
};

export const validator = (formData, requiredFormData) => {
  let firstErrorId;
  let result = {
    status: true,
    data: {},
  };

  for (const key in formData) {
    if (requiredFormData.hasOwnProperty(key)) {
      if (!formData[key]) {
        console.log(key);
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

export const filterSelectedItems = (arr1, arr2) => {
  let res = [];
  res = arr1.filter((el) => {
    return !arr2.find((element) => {
      return element === el;
    });
  });
  return res;
};

export const calculatePrice = (data) => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    console.log(data[i]);
    sum += data[i].price;
  }
  return sum;
};

export const handleExport = (data) => {
  const fileName = "download";
  const exportType = exportFromJSON.types.csv;
  exportFromJSON({ data, fileName, exportType });
};
export const uploadSingleImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await postRequest(
      "/vendor/products/single-image",
      formData,
      true
    );
    if (response.data) {
      return {
        asset_id: response?.data.asset_id,
        public_id: response?.data.public_id,
        secure_url: response?.data.secure_url,
      };
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const modifySizeHandler = (value) => {
  const size =
    value === "Extra small"
      ? "XS"
      : value === "Small"
      ? "S"
      : value === "Medium"
      ? "M"
      : value === "Large"
      ? "L"
      : value === "Extra Extra Large"
      ? "XXL"
      : value === "Extra large"
      ? "XL"
      : "";
  return size;
};


 export const statusHandler = (item) => {
  let status;
  if (item.status === "out-for-delivery") {
    status = {
      name: "Out for delivery",
      bg: "bg-[#D4CFCA]",
      text: "text-[#3E1C01]",
    };
  } else if (item.status === "return") {
    status = {
      name: "Return",
      bg: "bg-[#9747FF21]",
      text: "text-[#A869FA]",
    };
  } else if (item.status === "pending") {
    status = {
      name: "pending",
      bg: "bg-[#FFF7DE]",
      text: "text-[#FFB020]",
    };
  } else if (item.status === "completed") {
    status = {
      name: "completed",
      bg: "bg-[#33CC331A]",
      text: "text-[#33CC33]",
    };
  } else if (item.status === "Successful") {
    status = {
      name: "Successful",
      bg: "bg-[#FFF5F5]",
      text: "text-[#33CC33]",
    };
  } else {
    status = { name: "Return", bg: "bg-[#D4CFCA]" };
  }
  return status
}