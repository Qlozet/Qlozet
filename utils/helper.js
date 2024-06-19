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
