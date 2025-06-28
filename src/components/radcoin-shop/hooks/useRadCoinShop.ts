
import { HelpPackage, SpecialOffer } from './useRadCoinData';
import { useRadCoinPurchase } from './useRadCoinPurchase';

export function useRadCoinShop() {
  const { purchaseItem, isPurchasing } = useRadCoinPurchase();

  // Dados dos pacotes de ajuda
  const helpPackages: HelpPackage[] = [
    {
      id: 'basic-help',
      name: 'Pacote Básico',
      description: 'Ajudas essenciais para começar',
      price: 100,
      benefits: {
        elimination_aids: 10,
        skip_aids: 5,
        ai_tutor_credits: 3
      }
    },
    {
      id: 'advanced-help',
      name: 'Pacote Avançado',
      description: 'Mais ajudas para acelerar seu progresso',
      price: 250,
      benefits: {
        elimination_aids: 30,
        skip_aids: 15,
        ai_tutor_credits: 10
      },
      popular: true,
      discount: 20
    },
    {
      id: 'premium-help',
      name: 'Pacote Premium',
      description: 'Tudo que você precisa para dominar',
      price: 500,
      benefits: {
        elimination_aids: 75,
        skip_aids: 40,
        ai_tutor_credits: 25
      },
      discount: 30
    }
  ];

  // Dados das ofertas especiais
  const specialOffers: SpecialOffer[] = [
    {
      id: 'weekend-deal',
      name: 'Mega Pacote Weekend',
      description: 'Oferta especial de fim de semana',
      originalPrice: 400,
      salePrice: 200,
      discount: 50,
      timeLeft: '2d 14h 23m',
      benefits: {
        elimination_aids: 50,
        skip_aids: 25,
        ai_tutor_credits: 15,
        bonus_points_multiplier: 1.5
      },
      limited: true
    },
    {
      id: 'flash-sale',
      name: 'Flash Sale Extremo',
      description: 'Por tempo limitado!',
      originalPrice: 300,
      salePrice: 150,
      discount: 50,
      timeLeft: '4h 32m',
      benefits: {
        elimination_aids: 40,
        skip_aids: 20,
        ai_tutor_credits: 12
      },
      limited: true
    }
  ];

  return {
    helpPackages,
    specialOffers,
    isPurchasing,
    purchaseHelpPackage: purchaseItem,
    purchaseSpecialOffer: purchaseItem
  };
}

// Re-export tipos para compatibilidade
export type { HelpPackage, SpecialOffer } from './useRadCoinData';
