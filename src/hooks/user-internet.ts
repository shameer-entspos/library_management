import { useEffect, useState } from "react";

export function useInternetCheck(
  url = "https://www.google.com/favicon.ico",
  interval = 10000
) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        await fetch(url, {
          method: "HEAD",
          cache: "no-store",
          mode: "no-cors",
        });
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };

    check();
    const id = setInterval(check, interval);

    return () => clearInterval(id);
  }, [url, interval]);

  return online;
}