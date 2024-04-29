

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
