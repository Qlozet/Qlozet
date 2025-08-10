interface ValidationResult {
  status: boolean;
  data: { [key: string]: boolean };
  id?: string;
}

const validator = (formData: { [key: string]: any }, requiredFormData: { [key: string]: any }): ValidationResult => {
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

export default validator;