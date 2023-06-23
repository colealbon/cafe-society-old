export type cleanPostItemType = {
  title: {[key: string]: string};
  link: {[key: string]: string};
  description: {[key: string]: string}
}

export type dispatcherValueType = {
  [key: string]: any;
  checked: boolean;
  action: string;
  keys?: [string]
}

export type feedValueType = {
  [key: string]: any;
  title: string;
  description: string;
  items: [cleanPostItemType]
}

export type feedType = {
  [key: string]: {
    checked: boolean, categories: string[]
  }
}

export type predictionType = {
  [key: string]: any;
  likelihoods?: { proba?: any, category?: any }[];
  thresholdSuppressDocCount?: number;
  thresholdPromoteDocCount?: number;
}