import { useEffect, useState } from "react";

import { Div } from "style-props-html";

import { TBody, TReturn } from "@/api-types/hello";
import { createRouteClient } from "@/utils/rpc/client";

export default function HelloAPI() {
  const [result, setResult] = useState<TReturn | null>(null);
  const [error, setError] = useState<unknown | null>(null);

  const routeClient = createRouteClient<TBody, TReturn>({
    url: "/api/hello",
    method: "GET",
  });

  async function loadData() {
    try {
      setResult(await routeClient());
    } catch (e) {
      setError(e);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Div whiteSpace="pre-wrap">
      {result === null && error === null ? (
        "loading..."
      ) : error ? (
        <>{JSON.stringify(error, null, 2)}</>
      ) : (
        <>{JSON.stringify(result, null, 2)}</>
      )}
    </Div>
  );
}
