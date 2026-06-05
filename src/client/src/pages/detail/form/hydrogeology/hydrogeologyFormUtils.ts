export const getIsoDateIfDefined = (date: string | null | undefined) => {
  return date ? date + ":00.000Z" : null;
};
