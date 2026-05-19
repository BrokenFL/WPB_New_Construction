export type EditorProjectOverride = {
  name?: string;
  status?: string;
  delivery?: string;
  deliveryYear?: number;
  residences?: string;
  price?: string;
  image?: string;
  summary?: string;
  pageState?: string;
  address?: string;
  draft?: {
    title?: string;
    intro?: string;
    image?: string;
    imageAlt?: string;
    stage?: string;
    locationCopy?: string;
    needed?: string[];
  };
};

export type EditorProjectOverrides = Record<string, EditorProjectOverride>;

export const editorProjectOverrides = {} satisfies EditorProjectOverrides;
