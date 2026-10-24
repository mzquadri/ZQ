import {
  amplitudeOrderRecovered,
  cities,
  dataset,
  humidityAllOneWay,
  humidityMiss,
  tempMiss,
  text,
} from "@/content/weather-chapter";

import type { WeatherKey } from "./states";

/** The numbers beside the frame: configured against recovered, computed rather than asserted. */

function Row({ label, value, tone }: { label: string; value: string; tone?: "warn" | "good" }) {
  return (
    <div className="world-readout-row" data-tone={tone}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

const signed = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}`;

export default function Readout({ state }: { state: WeatherKey }) {
  if (state === "cities") {
    return (
      <dl className="world-readout">
        <Row label="Cities" value={String(dataset.cities)} />
        <Row label="Years" value={String(dataset.years)} />
        <Row
          label="Checkable because"
          value="The generator's configuration is in the repository"
          tone="good"
        />
      </dl>
    );
  }

  if (state === "temperature" || state === "zero") {
    return (
      <dl className="world-readout">
        {cities.map((city) => (
          <Row key={city.city} label={city.city} value={`${signed(tempMiss(city))} C`} />
        ))}
        <Row label="Furthest out" value={`${text.worstTemp} C`} tone="good" />
      </dl>
    );
  }

  if (state === "humidity" || state === "bias") {
    return (
      <dl className="world-readout">
        {cities.map((city) => (
          <Row key={city.city} label={city.city} value={`${signed(humidityMiss(city))} pts`} tone="warn" />
        ))}
        <Row
          label="All the same direction"
          value={humidityAllOneWay ? `yes, +${text.humidityLow} to +${text.humidityHigh}` : "no"}
          tone="warn"
        />
      </dl>
    );
  }

  if (state === "ranking") {
    return (
      <dl className="world-readout">
        <Row
          label="Configured swing against recovered spread"
          value={amplitudeOrderRecovered ? "same order, nothing crosses" : "the order changes"}
          tone={amplitudeOrderRecovered ? "good" : "warn"}
        />
      </dl>
    );
  }

  return (
    <dl className="world-readout">
      <Row label="Records" value={String(dataset.records)} />
      <Row label="Seed" value={String(dataset.seed)} />
      <Row
        label="What this establishes"
        value="That the analysis reads its own input correctly"
        tone="warn"
      />
    </dl>
  );
}
