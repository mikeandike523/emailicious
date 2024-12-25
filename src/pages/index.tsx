import Head from "next/head";
import { Div, Nav, Main } from "style-props-html";

export default function Home() {
  return (
    <>
      <Head>
        <title>STEAMHelp Pittsburgh</title>
        <meta
          name="description"
          content="Private STEAM Tutoring in Pittsburgh, PA"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Div width="100%">
        <Nav width="100%"></Nav>
        <Main width="100%"></Main>
      </Div>
    </>
  );
}
