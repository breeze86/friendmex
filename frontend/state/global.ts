import { useState } from "react";
import { createContainer } from "unstated-next";

function useGlobal() {
  const [address, setAddress] = useState<string>("");
  return { address, setAddress };
}

export const Global = createContainer(useGlobal);
