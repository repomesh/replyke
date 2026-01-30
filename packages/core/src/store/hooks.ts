import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { AppDispatch } from "./types";
import type { ReplykeState } from "./replykeReducers";

/**
 * Typed dispatch hook for Replyke.
 * Works in both standalone and integration modes.
 */
export const useReplykeDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector hook for Replyke state.
 * Works in both standalone and integration modes.
 *
 * State is always accessed via the 'replyke' namespace.
 */
export const useReplykeSelector: TypedUseSelectorHook<{ replyke: ReplykeState }> = useSelector;
