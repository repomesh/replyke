import { useContext } from "react";
import {
  SublayContext,
  SublayContextValues,
} from "../../context/sublay-context";

export default function useProject(): Partial<SublayContextValues> {
  return useContext(SublayContext);
}
