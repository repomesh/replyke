import React, { createContext } from "react";
import useEntityData, {
  UseEntityDataProps,
  UseEntityDataValues,
} from "../hooks/entities/useEntityData";

export type EntityContextProps = UseEntityDataProps & {
  children: React.ReactNode;
};
export interface EntityContextValues extends UseEntityDataValues {}

export const EntityContext = createContext<Partial<EntityContextValues>>({});

export const EntityProvider: React.FC<EntityContextProps> = ({
  children,
  ...restOfProps
}: EntityContextProps) => {
  const data = useEntityData(restOfProps);

  if (
    !('foreignId' in restOfProps && restOfProps.foreignId) &&
    !('entityId' in restOfProps && restOfProps.entityId) &&
    !('shortId' in restOfProps && restOfProps.shortId) &&
    !('entity' in restOfProps && restOfProps.entity?.id)
  ) {
    // console.warn(
    //   "Please pass an entity ID, reference ID, short ID or a complete entity object to the EntityProvider"
    // );

    return null;
  }

  return (
    <EntityContext.Provider value={data}>{children}</EntityContext.Provider>
  );
};
