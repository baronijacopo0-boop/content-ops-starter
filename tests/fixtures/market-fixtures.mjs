// Shared fake API payloads (eBay Browse API / Etsy Open API v3 shapes) for unit and E2E tests.
export const EBAY_SEARCH = {
  total: 4,
  itemSummaries: [
    {
      itemId: 'v1|1111|0',
      title: 'Felpa Carhartt WIP vintage con cappuccio taglia L grigia',
      price: { value: '18.00', currency: 'EUR' },
      image: { imageUrl: 'https://i.ebayimg.com/images/g/abc/s-l500.jpg' },
      condition: 'Usato',
      conditionId: '3000',
      itemWebUrl: 'https://www.ebay.it/itm/1111',
      itemCreationDate: '2026-10-26T10:00:00.000Z',
      seller: { username: 'vintage_store_it', feedbackPercentage: '99.2' },
      shippingOptions: [{ shippingCostType: 'FIXED', shippingCost: { value: '5.50', currency: 'EUR' } }],
    },
    {
      itemId: 'v1|2222|0',
      title: 'Patagonia Synchilla fleece pile anni 90 Size M',
      price: { value: '25.00', currency: 'EUR' },
      image: { imageUrl: 'https://i.ebayimg.com/images/g/def/s-l500.jpg' },
      condition: 'Usato - Ottime condizioni',
      conditionId: '2990',
      itemWebUrl: 'https://www.ebay.it/itm/2222',
      itemCreationDate: '2026-10-26T09:00:00.000Z',
      seller: { username: 'retro_closet', feedbackPercentage: '100.0' },
      shippingOptions: [{ shippingCostType: 'FIXED', shippingCost: { value: '0.00', currency: 'EUR' } }],
    },
    {
      itemId: 'v1|3333|0',
      title: 'Lotto 10 libri usati',
      price: { value: '5.00', currency: 'EUR' },
      conditionId: '3000',
    },
    {
      itemId: 'v1|4444|0',
      title: 'Stussy hoodie black XL',
      price: { value: '40.00', currency: 'USD' },
      conditionId: '3000',
    },
  ],
};

export const ETSY_SEARCH = {
  count: 2,
  results: [
    {
      listing_id: 9001,
      title: "Vintage Levi's 501 jeans W32 L32 made in USA",
      description: 'Great vintage condition, light fade.',
      price: { amount: 3500, divisor: 100, currency_code: 'EUR' },
      url: 'https://www.etsy.com/listing/9001/vintage-levis-501',
      created_timestamp: 1793000000,
      num_favorers: 12,
    },
    {
      listing_id: 9002,
      title: 'Vintage Stüssy t-shirt 90s',
      price: { amount: 4500, divisor: 100, currency_code: 'USD' },
      url: 'https://www.etsy.com/listing/9002/x',
      created_timestamp: 1793000000,
    },
  ],
};

export const ETSY_BATCH = {
  results: [
    { listing_id: 9001, images: [{ url_570xN: 'https://i.etsystatic.com/1/r/il/abc/il_570xN.jpg' }] },
  ],
};
