# Easy Drop — Live Server Version

This package preserves the original React/TypeScript/Vite project in `src/` exactly as supplied.

For VS Code Live Server, open the `live/` folder's `index.html` with Live Server. The `live/src/` directory contains browser-ready JavaScript generated from the original `src/` source without changing the original source files.

## Run with Live Server

1. Open this project folder in VS Code.
2. Open the `live` folder.
3. Right-click `live/index.html`.
4. Choose **Open with Live Server**.
5. Use the browser URL Live Server opens.

The Live Server adapter uses browser-compatible React/ReactDOM, Tailwind browser runtime, clsx and tailwind-merge from CDN URLs. Internet access is therefore required when the page loads.

## Original project

The original Vite project files remain unchanged:
- `src/`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- original `index.html`

The Live Server layer is contained in `live/`.
