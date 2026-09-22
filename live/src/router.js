import { jsx as _jsx } from "https://esm.sh/react@19.2.6/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "https://esm.sh/react@19.2.6";
const RouterContext = createContext(null);
const parse = () => {
    const raw = window.location.hash.replace(/^#/, "") || "/";
    const [path, query = ""] = raw.split("?");
    return { path: path || "/", params: new URLSearchParams(query) };
};
export function RouterProvider({ children }) {
    const [route, setRoute] = useState(parse);
    useEffect(() => {
        const onHash = () => {
            setRoute(parse());
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);
    const navigate = useCallback((to, opts) => {
        const target = `#${to.startsWith("/") ? to : `/${to}`}`;
        if (opts?.replace)
            window.location.replace(target);
        else
            window.location.hash = target;
        try {
            window.scrollTo({ top: 0 });
        }
        catch {
            /* non-browser environments */
        }
    }, []);
    const setParam = useCallback((key, value) => {
        const { path, params } = parse();
        if (value === undefined || value === null || value === "")
            params.delete(key);
        else
            params.set(key, value);
        const qs = params.toString();
        window.location.hash = `#${path}${qs ? `?${qs}` : ""}`;
    }, []);
    const value = useMemo(() => ({ path: route.path, params: route.params, navigate, setParam }), [route, navigate, setParam]);
    return _jsx(RouterContext.Provider, { value: value, children: children });
}
export function useRouter() {
    const ctx = useContext(RouterContext);
    if (!ctx)
        throw new Error("useRouter must be used inside <RouterProvider>");
    return ctx;
}
export function Link({ to, className, children, onClick, ...rest }) {
    const { navigate } = useRouter();
    return (_jsx("a", { href: `#${to}`, className: className, onClick: (e) => {
            e.preventDefault();
            onClick?.();
            navigate(to);
        }, ...rest, children: children }));
}
