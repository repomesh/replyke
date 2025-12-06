import { useContext } from "react";
import { SpaceContext } from "../../context/space-context";
import { UseSpaceDataValues } from "./useSpaceData";

const useSpace = (): UseSpaceDataValues => {
  const context = useContext(SpaceContext);

  if (!context) {
    throw new Error("useSpace must be used within a SpaceProvider");
  }

  return context as UseSpaceDataValues;
};

export default useSpace;
