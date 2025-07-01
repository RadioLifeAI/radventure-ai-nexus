
// Re-export dos novos hooks integrados ao Supabase
export { useRadCoinStore } from './useRadCoinStore';
export { useRadCoinAnalytics } from './useRadCoinAnalytics';
export { useStoreConfig } from './useStoreConfig';

// Import local para usar no hook principal
import { useRadCoinStore } from './useRadCoinStore';

// Interfaces mantidas para compatibilidade
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

// Hook principal integrado (substitui o anterior)
export function useRadCoinData() {
  const {
    products,
    specialOffers,
    storeConfig,
    purchaseHistory,
    isLoadingProducts,
    isLoadingOffers,
    isPurchasing,
    purchaseProduct,
    purchaseSpecialOffer,
    purchaseItem,
    helpPackages,
    isStoreEnabled,
    storeAnnouncement,
    dailyDealsEnabled
  } = useRadCoinStore();

  // Transformar dados para compatibilidade com interface anterior
  const helpPackagesCompat: HelpPackage[] = helpPackages.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description || '',
    price: pkg.price,
    benefits: pkg.benefits,
    popular: pkg.is_popular,
    discount: pkg.discount_percentage
  }));

  const specialOffersCompat: SpecialOffer[] = specialOffers.map(offer => ({
    id: offer.id,
    name: offer.name,
    description: offer.description || '',
    originalPrice: offer.original_price,
    salePrice: offer.sale_price,
    discount: offer.discount_percentage,
    timeLeft: offer.timeLeft || '',
    benefits: offer.benefits,
    limited: offer.limited
  }));

  return {
    helpPackages: helpPackagesCompat,
    specialOffers: specialOffersCompat,
    purchaseHistory,
    isLoading: isLoadingProducts || isLoadingOffers,
    isPurchasing,
    purchaseItem,
    purchaseProduct,
    purchaseSpecialOffer,
    storeConfig,
    isStoreEnabled,
    storeAnnouncement,
    dailyDealsEnabled
  };
}
