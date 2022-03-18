export interface MetaData {
  name: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: any;
  symbol: string;
}
