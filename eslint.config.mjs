import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Generated build output (and vendored deps) must never be linted:
  // `eslint .` would otherwise pick up minified React runtime chunks.
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**'] },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
