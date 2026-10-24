import { cities, humidityAxis, humidityMiss, tempAxis, tempMiss } from "@/content/weather-chapter";

/**
 * The layout of the weather world.
 *
 * Zero is a plane at x = 0 and a city's miss is its distance from it, on that statistic's own
 * scale. The two statistics sit at two depths so they can be compared without being plotted on one
 * axis they do not share - a tenth of a degree and two points of humidity are not the same
 * quantity, and nothing here pretends they are.
 */

export const SPREAD = 4.2;
export const ROW_Z = { temperature: 1.4, humidity: -1.4 } as const;
export const PLANE = { width: 0.06, height: 2.4, depth: 5.0 } as const;

export interface Mark {
  readonly city: string;
  /** Position on the temperature row, as a share of that axis's half-width. */
  readonly temperature: number;
  readonly humidity: number;
  /** Lateral slot, so six cities do not occupy one point. */
  readonly y: number;
}

export const MARKS: readonly Mark[] = cities.map((city, i) => ({
  city: city.city,
  temperature: (tempMiss(city) / tempAxis) * SPREAD,
  humidity: (humidityMiss(city) / humidityAxis) * SPREAD,
  y: (i - (cities.length - 1) / 2) * 0.34,
}));

/** The two orderings the ranking check compares, by city name. */
export const BY_AMPLITUDE = [...cities].sort((a, b) => b.setAmp - a.setAmp).map((c) => c.city);
export const BY_SPREAD = [...cities].sort((a, b) => b.foundTempSd - a.foundTempSd).map((c) => c.city);
