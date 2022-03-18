export type Attributes = Array<{ trait_type: string; value: string }>;

export const getAttributeValue = (attributes: Attributes, trait_type: string) => {
  return attributes?.find(attribute => attribute.trait_type === trait_type)?.value;
};
