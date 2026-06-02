import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { AppDispatch } from "./types";
import type { SublayState } from "./sublayReducers";

/**
 * Typed dispatch hook for Sublay.
 * Works in both standalone and integration modes.
 */
export const useSublayDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector hook for Sublay state.
 * Works in both standalone and integration modes.
 *
 * State is always accessed via the 'sublay' namespace.
 */
export const useSublaySelector: TypedUseSelectorHook<{ sublay: SublayState }> = useSelector;
