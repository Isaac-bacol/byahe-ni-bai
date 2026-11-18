import type { IncomingMessage, ServerResponse } from 'node:http';
import { createFallbackFuelPriceFeed, fetchAndParseFuelPricePh } from '../src/lib/fuelPriceParser';

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default async function handler(_req: IncomingMessage, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const data = await fetchAndParseFuelPricePh();
    res.status(200).json(data);
  } catch (error) {
    console.warn('[api/fuelprice] Falling back to cached/baseline schedule:', error);
    const fallback = createFallbackFuelPriceFeed();
    res.status(200).json(fallback);
  }
}
