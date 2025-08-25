import { useState, useEffect } from "react";

export function useFolders() {
  const [folders, setFolders] = useState<string[]>([]);

  useEffect(() => {
    // fetch or load folders here
  }, []);

  return { folders, setFolders };
}
