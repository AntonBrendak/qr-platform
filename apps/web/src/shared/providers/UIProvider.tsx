'use client';

import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {
  type ComponentRegistry,
  defaultRegistry,
  mergeRegistry
} from '../config/component-registry';

type UIContextValue = {
  registry: ComponentRegistry;
  /** Наложить патч настроек (как из админки/бэка) */
  setOverrides: (patch: Partial<ComponentRegistry>) => void;
  /** Сбросить к исходным overrides (из пропсов провайдера) */
  resetOverrides: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({
  children,
  overrides
}: {
  children: React.ReactNode;
  /** Опционально: SSR-инъекция настроек с бэка (per-tenant) */
  overrides?: Partial<ComponentRegistry>;
}) {
  const [custom, setCustom] = useState<Partial<ComponentRegistry>>(overrides ?? {});

  // 1) Гидрация из window.__QC_COMPONENT_REGISTRY__ (живой превью из админки)
  useEffect(() => {
    const w = globalThis as any;
    if (w && w.__QC_COMPONENT_REGISTRY__ && Object.keys(w.__QC_COMPONENT_REGISTRY__).length) {
      setCustom((prev) => mergeRegistry(prev, w.__QC_COMPONENT_REGISTRY__));
    }
  }, []);

  // 2) Подписка на клиентские патчи (быстрый превью без перезагрузки)
  useEffect(() => {
    function onPatch(e: Event) {
      const detail = (e as CustomEvent).detail as Partial<ComponentRegistry>;
      if (detail && typeof detail === 'object') {
        setCustom((prev) => mergeRegistry(prev, detail));
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('__qc_component_registry_patch__', onPatch as EventListener);
      return () =>
        window.removeEventListener('__qc_component_registry_patch__', onPatch as EventListener);
    }
  }, []);

  const value = useMemo<UIContextValue>(() => {
    const merged = mergeRegistry(defaultRegistry, custom);
    return {
      registry: merged,
      setOverrides: (patch) => setCustom((prev) => mergeRegistry(prev, patch)),
      resetOverrides: () => setCustom(overrides ?? {})
    };
  }, [custom, overrides]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within <UIProvider>');
  return ctx;
}

/**
 * Опционально: вызови в консоли браузера для dev-превью:
 *   window.__QC_COMPONENT_REGISTRY__ = { button: { pill: true } }
 * или:
 *   window.dispatchEvent(new CustomEvent('__qc_component_registry_patch__', { detail: { button: { uppercase: true } }}))
 */
export function exposeUIRegistryDevHelper() {
  if (typeof window !== 'undefined') {
    (window as any).__QC_SET_COMPONENT_REGISTRY__ = (patch: Partial<ComponentRegistry>) => {
      window.dispatchEvent(new CustomEvent('__qc_component_registry_patch__', {detail: patch}));
    };
  }
}