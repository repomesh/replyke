import { useContext } from "react";
import {
  ThreadedStyleConfigContext,
  ThreadedStyleConfigContextValues,
} from "../context/threaded-style-config-context";

export default function useThreadedStyleConfig(): Partial<ThreadedStyleConfigContextValues> {
  return useContext(ThreadedStyleConfigContext);
}
