import { config } from 'dotenv';
config();

interface ShippingRate {
  courier: string;
  service: string;
  cost: number;
  estimatedDays: string;
  description: string;
}

const FALLBACK_SERVICES: Record<string, Array<{ service: string; perKg: number; days: string }>> = {
  jne: [
    { service: 'REG', perKg: 15000, days: '3-5' },
    { service: 'YES', perKg: 26000, days: '1-2' },
    { service: 'OKE', perKg: 13000, days: '4-6' },
  ],
  sicepat: [
    { service: 'GOKIL', perKg: 14000, days: '3-5' },
    { service: 'SIUNTUNG', perKg: 12000, days: '4-6' },
  ],
  jnt: [
    { service: 'EZ', perKg: 14500, days: '3-5' },
    { service: 'ECO', perKg: 12000, days: '4-7' },
  ],
  anteraja: [
    { service: 'REG', perKg: 15000, days: '3-5' },
    { service: 'NEXTDAY', perKg: 24000, days: '1-2' },
  ],
};

function buildFallbackRates(courier: string, weight: number, description: string): ShippingRate[] {
  const weightKg = Math.ceil(weight / 1000) || 1;
  const normalized = courier.toLowerCase();
  const services = FALLBACK_SERVICES[normalized] || [
    { service: 'REG', perKg: 15000, days: '3-5' },
  ];

  return services.map(item => ({
    courier: normalized,
    service: item.service,
    cost: weightKg * item.perKg,
    estimatedDays: `${item.days} hari`,
    description,
  }));
}

export const shippingService = {
  async calculateShipping(
    origin: { cityId: string; provinceId?: string },
    destination: { cityId: string; provinceId?: string },
    weight: number, // in grams
    courier: string = 'jne'
  ): Promise<
    {
      courier: string;
      service: string;
      cost: number;
      estimatedDays: string;
      description: string;
    }[]
  > {
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey) {
      // Fallback: weight-based estimate when no API key. Service names follow
      // each courier's real product line so checkout can quote and store them.
      return buildFallbackRates(courier, weight, 'Estimasi biaya (API RajaOngkir tidak dikonfigurasi)');
    }

    try {
      const response = await fetch('https://api.rajaongkir.com/starter/cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          key: apiKey,
        },
        body: new URLSearchParams({
          origin: origin.cityId,
          destination: destination.cityId,
          weight: weight.toString(),
          courier,
        }),
      });

      const data: any = await response.json();

      if (data.rajaongkir?.status?.code !== 200) {
        throw new Error(data.rajaongkir?.status?.description || 'Shipping API error');
      }

      const results = data.rajaongkir.results[0]?.costs || [];

      return results.map((cost: any) => ({
        courier: data.rajaongkir.results[0].code,
        service: cost.service,
        cost: cost.cost[0].value,
        estimatedDays: cost.cost[0].etd + ' hari',
        description: cost.description,
      }));
    } catch (error) {
      console.error('Shipping calculation error:', error);
      return buildFallbackRates(courier, weight, 'Estimasi biaya (fallback)');
    }
  },

  async getProvinces() {
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey) return [];

    const response = await fetch('https://api.rajaongkir.com/starter/province', {
      headers: { key: apiKey },
    });
    const data: any = await response.json();
    return data.rajaongkir?.results || [];
  },

  async getCities(provinceId: string) {
    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey) return [];

    const response = await fetch(`https://api.rajaongkir.com/starter/city?province=${provinceId}`, {
      headers: { key: apiKey },
    });
    const data: any = await response.json();
    return data.rajaongkir?.results || [];
  },
};
