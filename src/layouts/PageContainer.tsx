/**
 * Allows optional per-page overrides of default <head> items.
 */
export interface PageContainerProps {
  head: {
    title?: string;
  };
}

export const pageContainerDefaultProps: PageContainerProps = {
  head: {
    title: "STEAMHelp Pittsburgh",
  },
};

/**
 * Fills the viewport and sets metadata.
 */
export default function PageContainer() {}
