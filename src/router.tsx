import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Tiny hash router (no dependency, instant navigation).
 * Route shape: #/ops/deliveries?id=DW-10023
 */

interface RouteValue {
  path: string;
  params: URLSearchParams;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
  setParam: (key: string, value?: string | null) => void;
}

const RouterContext = createContext<RouteValue | null>(null);

const parse = () => {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, query = ""] = raw.split("?");
  return { path: path || "/", params: new URLSearchParams(query) };
};

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(parse);

  useEffect(() => {
    const onHash = () => {
      setRoute(parse());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    const target = `#${to.startsWith("/") ? to : `/${to}`}`;
    if (opts?.replace) window.location.replace(target);
    else window.location.hash = target;
    try {
      window.scrollTo({ top: 0 });
    } catch {
      /* non-browser environments */
    }
  }, []);

  const setParam = useCallback(
    (key: string, value?: string | null) => {
      const { path, params } = parse();
      if (value === undefined || value === null || value === "") params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      window.location.hash = `#${path}${qs ? `?${qs}` : ""}`;
    },
    [],
  );

  const value = useMemo(
    () => ({ path: route.path, params: route.params, navigate, setParam }),
    [route, navigate, setParam],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouteValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside <RouterProvider>");
  return ctx;
}

export function Link({
  to,
  className,
  children,
  onClick,
  ...rest
}: { to: string; className?: string; children: ReactNode; onClick?: () => void } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
>) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
