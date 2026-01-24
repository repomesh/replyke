export interface ImageVariant {
  path: string;           // Relative storage path (e.g., "avatars/abc123/original.webp")
  publicPath: string;     // Proxy URL for client access
  width: number;          // Pixel width
  height: number;         // Pixel height
  size: number;           // File size in bytes
  format: string;         // Image format (webp, jpeg, png)
}

export interface Image {
  fileId: string;         // Primary file ID (links to File table)
  imageId: string;        // Same as fileId (backward compatibility)
  status: "completed" | "failed";
  original: ImageVariant; // Original processed image
  variants: Record<string, ImageVariant>; // Named variants (thumbnail, small, medium, large)
  metadata: {
    originalFormat: string;    // Format before processing
    originalSize: number;      // Size before processing (bytes)
    exifStripped: boolean;     // Whether EXIF data was removed
    processingTime: number;    // Sharp processing time (milliseconds)
  };
  createdAt: string;      // ISO 8601 timestamp
}

export type ImageSizeConfig =
  | number[]                    // Array format: [150, 400, 800]
  | Record<string, number>;     // Object format: { thumb: 150, small: 400 }

export interface UploadImageOptions {
  // Size configuration (optional)
  sizes?: ImageSizeConfig;

  // Quality and format (optional)
  quality?: number;             // 1-100 (default: 80)
  format?: "webp" | "jpeg" | "png" | "original"; // default: "webp"

  // Processing options (optional)
  stripExif?: boolean;          // default: true
  fit?: "cover" | "contain" | "inside" | "outside"; // default: "cover"

  // Storage path (optional)
  // pathParts: ['avatars'] → {projectId}/avatars/{fileId}/filename
  // pathParts: [] → {projectId}/{fileId}/filename
  pathParts?: string[];

  // Optional associations (for cascade deletes)
  entityId?: string;
  commentId?: string;
  spaceId?: string;

  // Callbacks
  onProgress?: (progress: number) => void;
}
