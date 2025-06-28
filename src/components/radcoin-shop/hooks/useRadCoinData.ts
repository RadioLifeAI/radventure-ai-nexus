
export interface HelpPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: {
    elimination_aids?: number;
    skip_aids?: number;
    ai_tutor_credits?: number;
  };
  popular?: boolean;
  discount?: number;
}

export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  timeLeft: string;
  benefits: any;
  limited?: boolean;
}
