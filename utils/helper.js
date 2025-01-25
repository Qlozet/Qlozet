import { postRequest } from "@/api/method";
import Toast from "@/components/ToastComponent/toast";
import exportFromJSON from "export-from-json";
import toast from "react-hot-toast";

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
    if (response.data.secure_url) {
      return {
        asset_id: response?.data.asset_id,
        public_id: response?.data.public_id,
        secure_url: response?.data.secure_url,
      };
    } else {
      toast(<Toast text={"An error occurred"} type="danger" />);
      return null;
    }
  } catch (error) {
    console.error(error)
    toast(<Toast text={"An error occurred"} type="danger" />);
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
      bg: "#D4CFCA",
      text: "#3E1C01",
    };
  } else if (item.status === "return") {
    status = {
      name: "Return",
      bg: "#9747FF21",
      text: "#A869FA",
    };
  } else if (item.status === "pending") {
    status = {
      name: "pending",
      bg: "#FFF7DE",
      text: "#FFB020",
    };
  } else if (item.status === "completed") {
    status = {
      name: "completed",
      bg: "#33CC331A",
      text: "#33CC33",
    };
  } else if (item.status === "Successful") {
    status = {
      name: "Successful",
      bg: "#FFF5F5",
      text: "#33CC33",
    };
  } else {
    status = { name: "Return", bg: "#D4CFCA" };
  }
  return status
}

export const activeCheck = (status) => {
  let productStatus;
  if (status) {
    productStatus = {
      text: "Active",
      bgColor: "#33CC331A",
      color: "#33CC33",
    };
  } else {
    productStatus = {
      text: "Inactive",
      bgColor: "#FFF5F5",
      color: "#FF3A3A",
    };
  }
  return productStatus
}
export const customerActiveCheck = (status) => {
  let customerStatus
  if (status === "active") {
    customerStatus = {
      text: "Active",
      bgColor: "#33CC331A",
      color: "#33CC33",
    };
  } else {
    customerStatus = {
      text: "Inactive",
      bgColor: "#FFF5F5",
      color: "#FF3A3A",
    };
  }
  return customerStatus
}

export const walletStatusCheck = (item) => {
  let status;
  if (item === "pending") {
    status = {
      text: "pending",
      bgColor: "#FFF7DE",
      color: "#FFB020",
    };
  } else if (item === "completed") {
    status = {
      text: "completed",
      bgColor: "#33CC331A",
      color: "#33CC33",
    };
  } else if (item === "successful") {
    status = {
      text: "Successful",
      bgColor: "#33CC331A", color: "#33CC33",
    };
  } else {
    status = { color: "Return", bgColor: "#D4CFCA" };
  }
  return status
}

export const getRandomHexColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, '0')}`;
}