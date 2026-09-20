"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "watched-species";
const EMPTY: string[] = [];

// Cache pra `getSnapshot` devolver a mesma referência enquanto o valor salvo
// não mudar — senão o useSyncExternalStore re-renderiza em loop.
let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY };
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cache.raw) return cache.list;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : EMPTY;
    cache = { raw, list };
    return list;
  } catch {
    return EMPTY;
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage bloqueado (aba anônima, dados desativados): a lista só não persiste.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Mantém as outras abas abertas em sincronia.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Espécies que o jogador quer acompanhar (destacadas em vermelho no feed).
 * Guardadas no navegador — cada aparelho tem a sua lista, sem conta nem servidor.
 */
export function useWatchedSpecies() {
  const watchedSpecies = useSyncExternalStore(subscribe, read, () => EMPTY);

  const addSpecies = useCallback((species: string) => {
    const normalized = species.trim().toLowerCase();
    if (!normalized) return;
    const current = read();
    if (current.includes(normalized)) return;
    write([...current, normalized]);
  }, []);

  const removeSpecies = useCallback((species: string) => {
    const normalized = species.trim().toLowerCase();
    write(read().filter((item) => item !== normalized));
  }, []);

  return { watchedSpecies, addSpecies, removeSpecies };
}
