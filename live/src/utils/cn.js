import { clsx } from "https://esm.sh/clsx@2.1.1";
import { twMerge } from "https://esm.sh/tailwind-merge@3.4.0";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
