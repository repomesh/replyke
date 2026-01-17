import { Entity } from "./Entity";

export interface Collection {
  id: string;
  projectId: string;
  userId: string;
  parentId: string | null;
  name: string;
  entityIds: string[];
  entities: Partial<Entity>[];
  createdAt: Date;
  updatedAt: Date;
}
