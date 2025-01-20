import { ReactNode } from "react";
import Head from "next/head";

export interface PageSetupProps {
  title?: string;
  description?: string;
  viewport?: string;
  favicon?: string;
  children?: ReactNode | ReactNode[];
}

export default function PageSetup({
  title = "Emailicious",
  description = "Smart Inbox Management Tools",
  viewport = "width=device-width, initial-scale=1",
  favicon = "/favicon.ico",
  children,
}: PageSetupProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content={viewport} />
        <link rel="icon" href={favicon} />
      </Head>
      {children}
    </>
  );
}
