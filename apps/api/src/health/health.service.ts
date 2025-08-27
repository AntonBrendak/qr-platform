import os from 'node:os';
import { Injectable } from '@nestjs/common';
import { monitorEventLoopDelay } from 'node:perf_hooks';

/** Статический ответ для /health (liveness) */
export type HealthPayload = {
  status: 'ok';
  ts: string;
  uptimeMs: number;
  pid: number;
  node: string;
};

/** Ответ для /ready (readiness) */
export type ReadyPayload = {
  ready: boolean;
  ts: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers?: number;
  };
  eventLoop: {
    meanMs: number;
    p95Ms: number;
  };
  cpuCount: number;
};

const startTime = Date.now();

/**
 * Гистограмма задержки event loop (узкое место Node).
 * resolution=20ms — достаточно для грубой оценки без лишних накладных.
 */
const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

@Injectable()
export class HealthService {
  /** Liveness: процесс жив, можно лупить перезапуском при падении */
  health(): HealthPayload {
    return {
      status: 'ok',
      ts: new Date().toISOString(),
      uptimeMs: Date.now() - startTime,
      pid: process.pid,
      node: process.version,
    };
  }

  /**
   * Readiness: простая эвристика «готов/не готов»:
   * - heapUsed/heapTotal < 0.9
   * - event loop p95 < 200ms
   * Если условия не выполняются → 503 на контроллере.
   */
  ready(): ReadyPayload {
    const mem = process.memoryUsage();
    const cpuCount = os.cpus()?.length ?? 1;

    const meanMs = Number(histogram.mean / 1e6); // ns → ms
    const p95Ms = Number(histogram.percentile(95) / 1e6);

    const ready = mem.heapUsed / mem.heapTotal < 0.9 && p95Ms < 200;

    return {
      ready,
      ts: new Date().toISOString(),
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external,
        arrayBuffers: (mem as any).arrayBuffers, // есть в Node ≥12; опционально
      },
      eventLoop: {
        meanMs: Number(meanMs.toFixed(2)),
        p95Ms: Number(p95Ms.toFixed(2)),
      },
      cpuCount,
    };
  }
}