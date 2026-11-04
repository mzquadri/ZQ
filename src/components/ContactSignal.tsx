import styles from "./ContactSignal.module.css";

const CHANNELS = [
  { label: "Email", x: 62, y: 84 },
  { label: "LinkedIn", x: 358, y: 84 },
  { label: "GitHub", x: 62, y: 336 },
  { label: "Work", x: 358, y: 336 },
];

const CENTRE = 210;

/**
 * The four ways to reach me, drawn as a small network around the site's mark.
 *
 * Decorative, because the links beside it carry the same names. Pure SVG and CSS, so it needs no
 * script. Under reduced motion it rests as a finished drawing.
 */
export default function ContactSignal() {
  return (
    <div aria-hidden="true" className={styles.stage}>
      <div className={styles.orbit} />
      <div className={styles.orbit} data-second="" />
      <svg className={styles.svg} viewBox="0 0 420 420">
        {CHANNELS.map((channel, i) => {
          const d = `M ${CENTRE} ${CENTRE} L ${channel.x} ${channel.y}`;
          return (
            <g key={channel.label} style={{ "--i": i } as React.CSSProperties}>
              <path className={styles.line} d={d} pathLength={100} />
              <circle className={styles.pulse} r="5" style={{ offsetPath: `path("${d}")` }} />
              <circle className={styles.node} cx={channel.x} cy={channel.y} r="30" />
              <text className={styles.label} textAnchor="middle" x={channel.x} y={channel.y + 5}>
                {channel.label}
              </text>
            </g>
          );
        })}
        <circle className={styles.core} cx={CENTRE} cy={CENTRE} r="42" />
        <text className={styles.coreLabel} textAnchor="middle" x={CENTRE} y={CENTRE + 7}>MZQ</text>
      </svg>
    </div>
  );
}
