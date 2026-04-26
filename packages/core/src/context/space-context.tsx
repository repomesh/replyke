import React, { createContext } from "react";
import useSpaceData, {
  UseSpaceDataProps,
  UseSpaceDataValues,
} from "../hooks/spaces/useSpaceData";

export interface SpaceContextProps extends UseSpaceDataProps {
  children: React.ReactNode;
}
export interface SpaceContextValues extends UseSpaceDataValues {}

export const SpaceContext = createContext<Partial<SpaceContextValues>>({});

export const SpaceProvider: React.FC<SpaceContextProps> = ({
  children,
  ...restOfProps
}: SpaceContextProps) => {
  const data = useSpaceData(restOfProps);

  if (
    !restOfProps.spaceId &&
    !restOfProps.shortId &&
    !restOfProps.slug &&
    !restOfProps.space?.id
  ) {
    return null;
  }

  return <SpaceContext.Provider value={data}>{children}</SpaceContext.Provider>;
};
