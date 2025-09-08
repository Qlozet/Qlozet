import { ValidationResult } from "@/types";

const validator = (formData: { [key: string]: any }, requiredFormData: { [key: string]: any }): ValidationResult => {
  let firstErrorId: string | undefined = undefined;
  let result: ValidationResult = {
    status: true,
    data: {},
    id: undefined,
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