import {
  bypass,
  configurations,
  controls,
  engineering,
  gatewaySource,
  known,
  limits,
  priorArt,
  stages,
  upstream,
  verdict,
} from "@/content/gateway-world";

/**
 * The case study for mcp-policy-gateway, in the order the argument actually runs.
 *
 * Three things this page has to do that a normal project page does not.
 *
 * It has to explain *when* each thing is trusted, because the whole contribution is that the three
 * moments are different and the existing tooling only reaches the first. So the trust boundary is
 * a table with a "can a scanner see this?" column, and that column is the thesis.
 *
 * It has to make the comparison unmissable. The interesting number is not 92.3% caught - a filter
 * can be tuned to catch anything - it is that the obvious alternative refuses two in five
 * legitimate calls. So the bars run in both directions from a shared centre: caught to the right,
 * refused to the left, same scale, and the keyword row is visibly worse in a way no caption has to
 * argue for.
 *
 * And it has to be honest about authorship. The protocol SDK is somebody else's work and is named
 * as a dependency in its own block, separately from the list of what I wrote.
 *
 * Every number is read from the content module, which is copied from generated files in the
 * repository at a pinned commit. Nothing here is typed by hand from memory.
 */

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

/* ---------------------------------------------------------------- the trust boundary */

export function TrustBoundary() {
  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>Technical question</strong>
        An MCP client trusts three things at three different times. Which of them can be checked
        before anyone runs anything?
      </figcaption>

      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>
            The third row is the one this project exists for. A document carrying an instruction did
            not exist when the server was scanned.
          </caption>
          <thead>
            <tr>
              <th scope="col">Moment</th>
              <th scope="col">Who wrote it</th>
              <th scope="col">Checkable in advance</th>
              <th scope="col">What can go wrong</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.key} data-scannable={stage.scannable ? "" : undefined}>
                <th scope="row">{stage.title}</th>
                <td>{stage.author}</td>
                <td>
                  <span className={stage.scannable ? "gw-yes" : "gw-no"}>
                    {stage.scannable ? "Yes — a scanner reads this" : "No"}
                  </span>
                </td>
                <td>{stage.threat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="research-note">
        Static scanners read declarations before use. That covers the first row well and cannot
        reach the third at all — not because the tools are weak, but because of when they run. The
        gateway sits at the protocol boundary, where all three are visible.
      </p>
    </figure>
  );
}

/* ---------------------------------------------------------------- the comparison */

export function GatewayComparison() {
  const scale = 1;
  return (
    <figure className="chart-figure research-figure gw-compare">
      <figcaption>
        <strong>Result</strong>
        Attacks caught against legitimate traffic refused, on {verdict.cases} deterministic cases.
        No model call, no network — the same table on any machine.
      </figcaption>

      <div className="gw-bars">
        <div className="gw-bars-axis" aria-hidden="true">
          <span className="gw-axis-left">legitimate traffic refused</span>
          <span className="gw-axis-right">attacks caught</span>
        </div>

        {configurations.map((cfg) => (
          <div className="gw-row" key={cfg.key} data-highlight={cfg.key === "gateway" ? "" : undefined}>
            <p className="gw-row-label">
              {cfg.label}
              <span className="gw-row-note">{cfg.note}</span>
            </p>
            <div className="gw-track">
              <div className="gw-half gw-half-left">
                <div
                  className="gw-bar gw-bar-refused"
                  style={{ width: `${(cfg.falseBlock / scale) * 100}%` }}
                />
                <span className="gw-value gw-value-left">{pct(cfg.falseBlock)}</span>
              </div>
              <div className="gw-half gw-half-right">
                <div
                  className="gw-bar gw-bar-caught"
                  style={{ width: `${(cfg.caught / scale) * 100}%` }}
                />
                <span className="gw-value gw-value-right">{pct(cfg.caught)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="research-note">
        The keyword filter is in the table because it is the real alternative — substring matching
        on the obvious phrases is what gets written when a team decides to do something about prompt
        injection. It catches {pct(configurations[1].caught)} of the attacks and refuses{" "}
        {pct(configurations[1].falseBlock)} of legitimate calls. That second number is the profile of
        a control an operator switches off, at which point its real effectiveness is zero. Comparing
        only against no gateway at all would have hidden that.
      </p>

      <p className="research-source">
        Source:{" "}
        <a
          className="text-link"
          href={gatewaySource.file("assets/results.json")}
          rel="noreferrer"
          target="_blank"
        >
          assets/results.json
        </a>{" "}
        at commit {gatewaySource.commit}, generated by <code>evaluation/make_evidence.py</code>.
      </p>
    </figure>
  );
}

/* ---------------------------------------------------------------- controls */

export function GatewayControls() {
  const decidable = controls.filter((c) => c.decidable);
  const touched = controls.filter((c) => c.benignTouched > 0);
  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>Where the uncertainty lives</strong>
        {controls.length} controls across three stages. {decidable.length} of them answer questions
        that have a decidable answer; one has to make a judgement.
      </figcaption>

      <div className="research-table-wrap">
        <table className="research-data-table">
          <caption>
            Counts sum to more than {verdict.attacks} because several cases are caught by more than
            one control. Every control runs on every event even after another has blocked, so these
            numbers are not an artefact of ordering.
          </caption>
          <thead>
            <tr>
              <th scope="col">Control</th>
              <th scope="col">Stage</th>
              <th scope="col">Attacks caught</th>
              <th scope="col">Benign touched</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((control) => (
              <tr key={control.name} data-judging={control.decidable ? undefined : ""}>
                <th scope="row">
                  <code>{control.name}</code>
                  <span className="gw-control-what">{control.what}</span>
                </th>
                <td>{control.stage}</td>
                <td>{control.caught}</td>
                <td>{control.benignTouched}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="research-note">
        <strong>
          {decidable.length} of {controls.length} controls have no false positives on this corpus.
        </strong>{" "}
        Every benign case that gets touched is touched by <code>{touched[0]?.name}</code>, the one
        control permitted to be uncertain. That is the argument for keeping judgement in a single
        place rather than spreading a little of it through all nine, and a test enforces it.
      </p>
    </figure>
  );
}

/* ---------------------------------------------------------------- known failures */

export function GatewayFailures() {
  const misses = known.filter((k) => k.kind === "miss");
  const falsePositives = known.filter((k) => k.kind === "false positive");
  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>What does not hold</strong>
        Four of {verdict.cases} cases are not handled. All four were written before the controls
        were, and a test names them exactly — so a <em>new</em> failure breaks the build rather than
        quietly lowering the headline.
      </figcaption>

      <div className="gw-failures">
        <div>
          <p className="gw-failure-kind">
            Missed attacks <span>{misses.length}</span>
          </p>
          {misses.map((item) => (
            <div className="gw-failure" key={item.id}>
              <p className="gw-failure-id">
                <code>{item.id}</code> {item.what}
              </p>
              <p className="gw-failure-why">{item.why}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="gw-failure-kind">
            False positives <span>{falsePositives.length}</span>
          </p>
          {falsePositives.map((item) => (
            <div className="gw-failure" key={item.id}>
              <p className="gw-failure-id">
                <code>{item.id}</code> {item.what}
              </p>
              <p className="gw-failure-why">{item.why}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="research-note">
        Both false positives are the same problem: a sentence is an attack or not depending on who
        is meant to read it, and that is not recoverable from the text. Any rule strong enough to
        catch a real injection catches a runbook that means it. This is the limit of the approach
        rather than a gap in the implementation.
      </p>
    </figure>
  );
}

/* ---------------------------------------------------------------- the bypass */

export function GatewayBypass() {
  return (
    <figure className="chart-figure research-figure gw-bypass">
      <figcaption>
        <strong>A bug the corpus could not find</strong>
        {bypass.title}
      </figcaption>

      <ol className="gw-bypass-steps">
        <li>
          <span className="gw-step-label">What happened</span>
          {bypass.what}
        </li>
        <li>
          <span className="gw-step-label">Why</span>
          {bypass.why}
        </li>
        <li>
          <span className="gw-step-label">Fix</span>
          {bypass.fix}
        </li>
      </ol>

      <p className="research-note">
        {bypass.lesson} It was found by {bypass.found.toLowerCase()} — the tests that launch a real
        MCP server as a subprocess and talk to it over stdio, rather than exercising the policy
        engine as a library.
      </p>
    </figure>
  );
}

/* ---------------------------------------------------------------- provenance */

export function GatewayProvenance() {
  return (
    <figure className="chart-figure research-figure gw-provenance">
      <figcaption>
        <strong>What is mine, and what is not</strong>
        The protocol is somebody else&rsquo;s work. Everything at the boundary is mine.
      </figcaption>

      <div className="gw-provenance-grid">
        <div className="gw-upstream">
          <p className="gw-prov-kind">Dependency &mdash; not my work</p>
          <p className="gw-prov-name">
            <a className="text-link" href={upstream.url} rel="noreferrer" target="_blank">
              {upstream.name}
            </a>
          </p>
          <dl className="gw-prov-facts">
            <div>
              <dt>Package</dt>
              <dd>
                <code>{upstream.package}</code>
              </dd>
            </div>
            <div>
              <dt>Licence</dt>
              <dd>{upstream.license}</dd>
            </div>
            <div>
              <dt>Copyright</dt>
              <dd>{upstream.holder}</dd>
            </div>
          </dl>
          <p className="gw-prov-role">{upstream.role}</p>
          <p className="gw-prov-role">{upstream.note}</p>
        </div>

        <div className="gw-mine">
          <p className="gw-prov-kind">Written for this project</p>
          <ul className="gw-prov-list">
            <li>The proxying gateway, fail-closed, over real stdio MCP</li>
            <li>All {controls.length} controls and the engine that combines their findings</li>
            <li>
              The corpus: {verdict.attacks} attacks across {verdict.attackClasses} classes and{" "}
              {verdict.benign} benign near-misses, with ground truth per case
            </li>
            <li>The three-configuration benchmark, including the keyword baseline</li>
            <li>The JSONL trace format that records digests rather than payloads</li>
            <li>
              {engineering.tests} tests, and CI running the benchmark and the end-to-end demo on{" "}
              {engineering.pythonVersions.join(", ")}
            </li>
          </ul>
        </div>
      </div>

      <p className="research-note">
        Prior art read but not used as code:{" "}
        {priorArt.map((item, index) => (
          <span key={item.name}>
            {index > 0 ? ", " : ""}
            <a className="text-link" href={item.url} rel="noreferrer" target="_blank">
              {item.name}
            </a>
          </span>
        ))}
        . The attack-class names in the corpus come from the OWASP taxonomy so that the results are
        comparable to categories other people already recognise. Full detail in{" "}
        <a className="text-link" href={gatewaySource.file("NOTICE")} rel="noreferrer" target="_blank">
          NOTICE
        </a>
        .
      </p>
    </figure>
  );
}

/* ---------------------------------------------------------------- limits */

export function GatewayLimits() {
  return (
    <figure className="chart-figure research-figure">
      <figcaption>
        <strong>What the deterministic design costs</strong>
        Every decision is a function of the text, which is what makes the benchmark reproduce
        exactly and CI need no API key. It is also why these five things are true.
      </figcaption>
      <ul className="gw-limits">
        {limits.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>
      <p className="research-note">
        The first is the important one. A paraphrased attack that avoids every pattern gets through,
        so {pct(configurations[2].caught)} is an upper bound against the attack forms represented
        rather than a general claim. A production deployment would sensibly run patterns at the
        boundary for the cheap certain cases and a model only for the ambiguous remainder.
      </p>
    </figure>
  );
}
