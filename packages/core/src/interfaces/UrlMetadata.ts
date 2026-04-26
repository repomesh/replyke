export interface UrlMetadataImage {
  url: string;
  width: number | null;
  height: number | null;
  type: string | null;
  alt: string | null;
}

export interface UrlMetadataVideo {
  url: string;
  width: number | null;
  height: number | null;
  type: string | null;
}

export interface UrlMetadataAudio {
  url: string;
  type: string | null;
}

export interface UrlMetadataTwitter {
  card: string | null;
  site: string | null;
  creator: string | null;
  title: string | null;
  description: string | null;
  images: UrlMetadataImage[];
  players: {
    url: string;
    width: number | null;
    height: number | null;
  }[];
}

export interface UrlMetadataArticle {
  publishedTime: string | null;
  modifiedTime: string | null;
  expirationTime: string | null;
  author: string | null;
  section: string | null;
  tag: string | null;
}

export interface UrlMetadataAppLinks {
  ios: {
    url: string;
    appStoreId: string | null;
    appName: string | null;
  } | null;
  android: {
    url: string;
    package: string | null;
    appName: string | null;
  } | null;
  web: {
    url: string;
    shouldFallback: string | null;
  } | null;
}

export interface UrlMetadata {
  title: string | null;
  description: string | null;
  siteName: string | null;
  url: string;
  type: string | null;
  locale: string | null;
  charset: string | null;
  favicon: string | null;

  images: UrlMetadataImage[];
  videos: UrlMetadataVideo[];
  audio: UrlMetadataAudio[];

  twitter: UrlMetadataTwitter;
  article: UrlMetadataArticle;

  jsonLd: Record<string, unknown>[] | null;

  appLinks: UrlMetadataAppLinks;

  book: {
    author: string | null;
    tag: string | null;
    isbn: string | null;
    releaseDate: string | null;
  } | null;

  music: {
    album: string | null;
    musician: string | null;
    duration: number | null;
    releaseDate: string | null;
    creator: string | null;
  } | null;

  profile: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    gender: string | null;
  } | null;

  requestUrl: string;
  success: boolean;
}
