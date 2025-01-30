export const getIsoDateIfDefined = (date: string | null) => {
  return date ? date + ":00.000Z" : null;
};
