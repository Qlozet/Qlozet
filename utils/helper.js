export const handleValidate = (schema, formData) => {
  const validatedData = schema.safeParse(formData);
  console.log("Valid data:", validatedData);
};

export const handlerContainsNumber = (str) => {
  const regex = /\d/;
  return regex.test(str);
};
