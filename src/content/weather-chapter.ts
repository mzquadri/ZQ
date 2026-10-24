/**
 * Weather EDA: an analysis that can only rediscover its own generator.
 *
 * The dataset here is produced by `src/generate_data.py` at a fixed seed. The
 * repository is explicit that it is not weather-station data, climate
 * evidence or a basis for any decision, and the figures are described as
 * recovering the generator's configured distributions rather than measuring
 * city climates.
 *
 * Taken at face value that sounds like a reason not to publish. It is in fact
 * the one thing that makes the project checkable: because the configuration
 * is in the repository and the summary statistics are a tracked artefact, the
 * analysis can be held to its own input. Below, the configured values from
 * the generator sit beside the values the exploratory analysis recovered, and
 * the comparison is computed rather than asserted.
 *
 * Two of the three comparisons come out as they should. The third does not,
 * and in the same direction for every city, which is the only finding here
 * that was not put in by hand.
 */

export const repository = "https://github.com/mzquadri/Weather-Data-Analytics-EDA";

export const dataset = {
  cities: 6,
  years: 10,
  from: "2014-01-01",
  to: "2023-12-29",
  records: 21900,
  seed: 42,
  figures: 12,
} as const;

export interface CityRow {
  readonly city: string;
  /** `base_temp` as the generator is configured, in degrees Celsius. */
  readonly setTemp: number;
  /** `amp`, the configured seasonal swing. */
  readonly setAmp: number;
  /** `humid_base`, the configured humidity, in percentage points. */
  readonly setHumidity: number;
  /** Mean daily temperature in the tracked summary. */
  readonly foundTemp: number;
  /** Standard deviation of daily temperature in the tracked summary. */
  readonly foundTempSd: number;
  /** Mean humidity in the tracked summary. */
  readonly foundHumidity: number;
}

/**
 * Configuration from `src/generate_data.py`, recovered values from
 * `results/city_summary_statistics.csv`. Ordered by configured temperature.
 */
export const cities: readonly CityRow[] = [
  { city: "Munich", setTemp: 8.5, setAmp: 12, setHumidity: 72, foundTemp: 8.56, foundTempSd: 8.83, foundHumidity: 74.35 },
  { city: "New York", setTemp: 12.5, setAmp: 14, setHumidity: 65, foundTemp: 12.57, foundTempSd: 10.28, foundHumidity: 67.42 },
  { city: "Tokyo", setTemp: 15.5, setAmp: 13, setHumidity: 68, foundTemp: 15.5, foundTempSd: 9.5, foundHumidity: 70.51 },
  { city: "Sydney", setTemp: 18.0, setAmp: 6, setHumidity: 62, foundTemp: 17.93, foundTempSd: 4.92, foundHumidity: 64.53 },
  { city: "Nairobi", setTemp: 18.5, setAmp: 2, setHumidity: 58, foundTemp: 18.59, foundTempSd: 2.81, foundHumidity: 60.26 },
  { city: "Delhi", setTemp: 25.0, setAmp: 10, setHumidity: 55, foundTemp: 24.98, foundTempSd: 7.47, foundHumidity: 57.2 },
];

export const tempMiss = (c: CityRow) => c.foundTemp - c.setTemp;
export const humidityMiss = (c: CityRow) => c.foundHumidity - c.setHumidity;

/** The largest distance between a configured temperature and the recovered one. */
export const worstTempMiss = Math.max(...cities.map((c) => Math.abs(tempMiss(c))));

/** Humidity misses, which are the interesting ones: all the same sign. */
export const humidityMisses = cities.map(humidityMiss);
export const humidityLow = Math.min(...humidityMisses);
export const humidityHigh = Math.max(...humidityMisses);
export const humidityAllOneWay = humidityMisses.every((m) => m > 0);

/**
 * Does the recovered spread rank the cities the same way the configured
 * seasonal amplitude does? Computed rather than eyeballed.
 */
export const amplitudeOrderRecovered = (() => {
  const byAmp = [...cities].sort((a, b) => b.setAmp - a.setAmp).map((c) => c.city);
  const bySd = [...cities].sort((a, b) => b.foundTempSd - a.foundTempSd).map((c) => c.city);
  return byAmp.every((name, i) => name === bySd[i]);
})();

/** Axis half-widths for the two panels, each a round number above its own data. */
export const tempAxis = 0.15;
export const humidityAxis = 3;

/** Position on a zero-centred axis, as a percentage from the left edge. */
export function centredPercent(value: number, half: number): number {
  return ((value + half) / (2 * half)) * 100;
}

export const text = {
  worstTemp: worstTempMiss.toFixed(2),
  humidityLow: humidityLow.toFixed(2),
  humidityHigh: humidityHigh.toFixed(2),
} as const;

/** What the exploratory pass produces, for the record. */
export const outputs = [
  "distributions and a monthly temperature heatmap per city",
  "seasonal comparisons, with the southern hemisphere reversed",
  "precipitation exceedance curves",
  "a correlation matrix and pairwise scatter",
] as const;
