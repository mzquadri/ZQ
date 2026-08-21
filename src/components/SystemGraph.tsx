"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  graphEdges,
  graphNodes,
  graphStages,
  getNode,
  getStageNodes,
  projectPoint,
  restingRotation,
  type ProjectedPoint,
} from "@/content/systems-graph";
import styles from "./SystemGraph.module.css";

const STATIC_WIDTH = 720;
const STATIC_HEIGHT = 400;
const DEFAULT_NODE = "reliable";

/** Fixed-rotation projection of the same graph, used where the interactive canvas is not run. */
function StaticGraph({ selectedId }: { selectedId: string }) {
  const unit = Math.min(STATIC_WIDTH / 8, STATIC_HEIGHT / 4.6);
  const points = new Map<string, ProjectedPoint>(
    graphNodes.map((node) => [
      node.id,
      projectPoint(node, restingRotation.yaw, restingRotation.pitch, STATIC_WIDTH, STATIC_HEIGHT, unit),
    ]),
  );
  const orderedNodes = [...graphNodes].sort((a, b) => points.get(a.id)!.depth - points.get(b.id)!.depth);

  return (
    <svg
      aria-hidden="true"
      className={styles.static}
      focusable="false"
      viewBox={`0 0 ${STATIC_WIDTH} ${STATIC_HEIGHT}`}
    >
      <g className={styles.staticEdges}>
        {graphEdges.map((edge) => {
          const from = points.get(edge.from)!;
          const to = points.get(edge.to)!;
          const highlight = edge.from === selectedId || edge.to === selectedId;
          return (
            <line
              data-highlight={highlight || undefined}
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              x2={to.x}
              y1={from.y}
              y2={to.y}
            />
          );
        })}
      </g>
      <g className={styles.staticNodes}>
        {orderedNodes.map((node) => {
          const point = points.get(node.id)!;
          const radius = (node.id === selectedId ? 12 : 9) * point.scale;
          return (
            <g
              data-selected={node.id === selectedId || undefined}
              data-status={node.status}
              key={node.id}
            >
              <circle cx={point.x} cy={point.y} r={radius} />
              <text textAnchor="middle" x={point.x} y={point.y + radius + 20}>
                {node.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export default function SystemGraph() {
  const [selectedId, setSelectedId] = useState(DEFAULT_NODE);
  const [interactive, setInteractive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedRef = useRef(selectedId);
  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // A missing 2D context leaves the static projection in place rather than an empty box.
    const context = canvas.getContext("2d");
    if (!context) return;

    const desktopQuery = window.matchMedia("(min-width: 760px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const rotation: { yaw: number; pitch: number } = {
      yaw: restingRotation.yaw,
      pitch: restingRotation.pitch,
    };
    let hitTargets: { id: string; x: number; y: number; radius: number }[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let active = false;
    let visible = false;
    let userControlled = false;
    let dragging = false;
    let pointerId = -1;
    let lastX = 0;
    let lastY = 0;
    let travel = 0;

    const readTheme = () => {
      const computed = getComputedStyle(container);
      const value = (name: string, fallback: string) => computed.getPropertyValue(name).trim() || fallback;
      return {
        ink: value("--ink", "#111820"),
        inkSoft: value("--ink-soft", "#354149"),
        teal: value("--teal", "#006d65"),
        paper: value("--paper-raised", "#fbfaf5"),
        font: computed.fontFamily || "sans-serif",
      };
    };
    let theme = readTheme();

    const shouldAutoRotate = () =>
      active && visible && !userControlled && !dragging && !motionQuery.matches && !document.hidden;

    const draw = () => {
      if (width === 0 || height === 0) return;

      const unit = Math.min(width / 8, height / 4.6);
      const points = new Map<string, ProjectedPoint>(
        graphNodes.map((node) => [node.id, projectPoint(node, rotation.yaw, rotation.pitch, width, height, unit)]),
      );
      const selected = selectedRef.current;
      const connected = new Set<string>();
      for (const edge of graphEdges) {
        if (edge.from === selected) connected.add(edge.to);
        if (edge.to === selected) connected.add(edge.from);
      }

      context.clearRect(0, 0, width, height);
      context.lineCap = "round";

      const orderedEdges = [...graphEdges].sort(
        (a, b) =>
          points.get(a.from)!.depth +
          points.get(a.to)!.depth -
          (points.get(b.from)!.depth + points.get(b.to)!.depth),
      );
      for (const edge of orderedEdges) {
        const from = points.get(edge.from)!;
        const to = points.get(edge.to)!;
        const highlight = edge.from === selected || edge.to === selected;
        context.strokeStyle = highlight ? theme.teal : theme.ink;
        context.globalAlpha = highlight ? 0.85 : 0.18;
        context.lineWidth = highlight ? 1.9 : 1;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }
      context.globalAlpha = 1;

      hitTargets = [];
      const orderedNodes = [...graphNodes].sort((a, b) => points.get(a.id)!.depth - points.get(b.id)!.depth);
      for (const node of orderedNodes) {
        const point = points.get(node.id)!;
        const isSelected = node.id === selected;
        const radius = (isSelected ? 11 : 8) * point.scale;
        hitTargets.push({ id: node.id, x: point.x, y: point.y, radius });

        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fillStyle = isSelected ? theme.teal : theme.paper;
        context.fill();
        // A dashed outline marks a direction of study that has no public artifact yet.
        if (node.status === "Direction") context.setLineDash([3, 3]);
        context.lineWidth = isSelected ? 2 : 1.3;
        context.strokeStyle = isSelected ? theme.teal : connected.has(node.id) ? theme.inkSoft : theme.ink;
        context.globalAlpha = node.status === "Direction" ? 0.7 : 1;
        context.stroke();
        context.setLineDash([]);

        const fontSize = Math.max(11, Math.round(12 * point.scale));
        context.font = `${isSelected ? 600 : 500} ${fontSize}px ${theme.font}`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = isSelected ? theme.ink : theme.inkSoft;
        context.globalAlpha = isSelected || connected.has(node.id) ? 1 : 0.6;
        context.fillText(node.label, point.x, point.y + radius + fontSize);
        context.globalAlpha = 1;
      }
    };

    const schedule = () => {
      if (frame !== 0 || !active) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (shouldAutoRotate()) rotation.yaw += 0.0024;
        draw();
        if (shouldAutoRotate()) schedule();
      });
    };
    redrawRef.current = schedule;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      theme = readTheme();
      schedule();
    };

    const applyMode = () => {
      active = desktopQuery.matches;
      setInteractive(active);
      if (active) {
        resize();
      } else if (frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const toCanvasPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!active) return;
      dragging = true;
      userControlled = true;
      travel = 0;
      pointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      travel += Math.abs(deltaX) + Math.abs(deltaY);
      rotation.yaw += deltaX * 0.008;
      rotation.pitch = Math.min(0.85, Math.max(-0.85, rotation.pitch + deltaY * 0.005));
      lastX = event.clientX;
      lastY = event.clientY;
      schedule();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      dragging = false;
      if (canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
      pointerId = -1;
      // A tap rather than a drag selects the nearest node, mirroring the buttons below.
      if (travel < 5) {
        const point = toCanvasPoint(event);
        const hit = hitTargets.find(
          (target) => Math.hypot(target.x - point.x, target.y - point.y) <= target.radius + 8,
        );
        if (hit) setSelectedId(hit.id);
      }
      schedule();
    };

    const onVisibilityChange = () => schedule();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) schedule();
      },
      { threshold: 0.12 },
    );
    intersectionObserver.observe(container);

    desktopQuery.addEventListener("change", applyMode);
    motionQuery.addEventListener("change", onVisibilityChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    applyMode();

    return () => {
      redrawRef.current = null;
      if (frame !== 0) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      desktopQuery.removeEventListener("change", applyMode);
      motionQuery.removeEventListener("change", onVisibilityChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  useEffect(() => {
    selectedRef.current = selectedId;
    redrawRef.current?.();
  }, [selectedId]);

  const selected = getNode(selectedId) ?? getNode(DEFAULT_NODE)!;

  return (
    <div
      className={styles.graph}
      data-mode={interactive ? "interactive" : "static"}
      id="systems-graph"
      ref={containerRef}
    >
      <div className={styles.viewport}>
        <StaticGraph selectedId={selectedId} />
        <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
        {interactive ? (
          <p aria-hidden="true" className={styles.hint}>
            Drag to rotate
          </p>
        ) : null}
      </div>

      <div className={styles.panel}>
        <ol className={styles.stages}>
          {graphStages.map((stage, index) => (
            <li key={stage.id}>
              <p className={styles.stageLabel}>
                <span aria-hidden="true">{(index + 1).toString().padStart(2, "0")}</span>
                {stage.label}
              </p>
              <p className={styles.stageSummary}>{stage.summary}</p>
              <div className={styles.nodeButtons}>
                {getStageNodes(stage.id).map((node) => (
                  <button
                    aria-pressed={node.id === selectedId}
                    className={styles.nodeButton}
                    data-status={node.status}
                    key={node.id}
                    onClick={() => setSelectedId(node.id)}
                    type="button"
                  >
                    {node.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <div aria-live="polite" className={styles.detail}>
          <p className={styles.detailStatus} data-status={selected.status}>
            {selected.status}
          </p>
          <h3 className={styles.detailTitle}>{selected.label}</h3>
          <p className={styles.detailBlurb}>{selected.blurb}</p>
          {selected.href ? (
            <Link className={styles.detailLink} href={selected.href}>
              See the evidence <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <p className={styles.detailNote}>No public project yet, so nothing is claimed here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
