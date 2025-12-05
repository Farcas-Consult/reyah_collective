import HandcraftedSilver from '@/assets/HandcraftedSilver.jpg';
import Beeswax from '@/assets/Beeswax.jpg';
import VintageLeatherJournals from '@/assets/VintageLeatherJournals.jpg';
import ArtisanCoffeeBlend from '@/assets/ArtisanCoffeeBlend.jpg';
import Art1 from '@/assets/Art1.jpg';
import Ecofriendly1 from '@/assets/Ecofriendly1.jpg';
import HandmadeJewelry1 from '@/assets/HandmadeJewelry1.jpg';
import HandmadeJewelry2 from '@/assets/HandmadeJewelry2.jpg';
import HandmadeJewelry3 from '@/assets/HandmadeJewelry3.jpg';
import HandmadeJewelry4 from '@/assets/HandmadeJewelry4.jpg';
import HandmadeJewelry5 from '@/assets/HandmadeJewelry5.jpg';
import Artisan1 from '@/assets/Artisan1.jpg';
import Artisan2 from '@/assets/Artisan2.jpg';
import Artisan3 from '@/assets/Artisan3.jpg';
import Artisan4 from '@/assets/Artisan4.jpg';
import Artisan5 from '@/assets/Artisan5.jpg';
import Vintage1 from '@/assets/Vintage1.jpg';
import Vintage2 from '@/assets/Vintage2.jpg';
import Vintage3 from '@/assets/Vintage3.jpg';
import Vintage4 from '@/assets/Vintage4.jpg';
import Vintage5 from '@/assets/Vintage5.jpg';
import Ecofriendly2 from '@/assets/Ecofriendly2.jpg';
import Ecofriendly3 from '@/assets/Ecofriendly3.jpg';
import Ecofriendly4 from '@/assets/Ecofriendly4.jpg';
import VintageCeramicPlanter from '@/assets/VintageCeramicPlanter.jpg';
import EmbroideryKit from '@/assets/EmbroideryKit.jpg';
import ReusableProduceBag from '@/assets/ReusableProduceBag.jpg';
import PureHoney from '@/assets/PureHoney.jpg';
import HandmadeSoap from '@/assets/HandmadeSoap.jpg';

// Product image mapping by product ID
export const PRODUCT_IMAGES: { [key: number]: any } = {
  1: HandcraftedSilver,
  2: Beeswax,
  3: VintageLeatherJournals,
  4: ArtisanCoffeeBlend,
  5: Art1,
  6: Ecofriendly1,
  7: Artisan2,
  8: Artisan3,
  9: Artisan4,
  10: Artisan5,
  11: Vintage1,
  12: Vintage2,
  13: Vintage3,
  14: Vintage4,
  15: Vintage5,
  21: Ecofriendly2,
  22: Ecofriendly3,
  23: Ecofriendly4,
  24: Ecofriendly1,
};

// Product image mapping by product name (for backward compatibility)
export const PRODUCT_IMAGES_BY_NAME: { [key: string]: any } = {
  'Handcrafted Silver Ring Set': HandcraftedSilver,
  'Handcrafted Silver Ring': HandcraftedSilver,
  'Organic Beeswax Food Wraps': Beeswax,
  'Vintage Leather Journal': VintageLeatherJournals,
  'Artisan Coffee Blend - 500g': ArtisanCoffeeBlend,
  'Artisan Coffee Blend': ArtisanCoffeeBlend,
  'Custom Macrame Wall Hanging': Art1,
  'Handmade Natural Soap Set': HandmadeSoap,
  'Beaded Necklace': HandmadeJewelry2,
  'Beaded Necklace with Pendant': HandmadeJewelry2,
  'Custom Copper Earrings': HandmadeJewelry3,
  'Leather Wrap Bracelet': HandmadeJewelry4,
  'Gemstone Pendant Necklace': HandmadeJewelry5,
  'Hand-Painted Ceramic Vase': Artisan2,
  'Ceramic Vase': Artisan2,
  'Artisan Scented Candle Set': Artisan3,
  'Handwoven Throw Pillow': Artisan4,
  'Wooden Wall Art Panel': Artisan5,
  'Antique Brass Candlestick': Vintage2,
  'Vintage Ceramic Planter': VintageCeramicPlanter,
  'Retro Wooden Photo Frame': Vintage4,
  'Antique Clock': Vintage5,
  'Vintage Clock': Vintage5,
  'Antique Mirror': Vintage2,
  'Handwoven Basket': Artisan1,
  'Gemstone Earrings': HandmadeJewelry3,
  'Reusable Produce Bags (5 Pack)': ReusableProduceBag,
  'Bamboo Cutlery Set': Ecofriendly3,
  'DIY Embroidery Kit': EmbroideryKit,
  'Artisan Honey - Pure Raw': PureHoney,
};

// Helper function to get product image
export function getProductImage(productIdOrName: number | string): any {
  if (typeof productIdOrName === 'number') {
    return PRODUCT_IMAGES[productIdOrName] || null;
  }
  return PRODUCT_IMAGES_BY_NAME[productIdOrName] || null;
}

// Helper function to get product image src
export function getProductImageSrc(productIdOrName: number | string): string {
  const image = getProductImage(productIdOrName);
  return image?.src || '';
}
