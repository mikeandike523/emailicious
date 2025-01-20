import { Main, H1, H2, A, P } from "style-props-html";
import PageSetup from "@/layouts/PageSetup";

export default function Home() {
  return (
    <PageSetup>
      <Main>
        <H1>Emailicious</H1>
        <H2>Mmm... Delicious Emails</H2>
        <P>
          Emailicious is a command line tool to automatically manage emails in
          bulk.
        </P>
        <A href="/tutorial">Tutorial</A>
      </Main>
    </PageSetup>
  );
}
