import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { plugin as shadcn } from "@shadcn/lint"

// Local rule: ban inline eslint-disable directives outright. Selector-based
// attempts (no-restricted-syntax on comment nodes) do not match reliably,
// so this walks sourceCode.getAllComments() directly. Combined with
// reportUnusedDisableDirectives below, an agent cannot silence a rule
// in-place: the directive itself is an error whether or not it fires.
const noInlineDisables = {
  meta: { type: "problem", schema: [] },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (/\beslint-disable\b/i.test(comment.value)) {
            context.report({
              node: comment,
              message:
                "Inline eslint-disable is banned in this repo. Fix the violation instead; if a rule is genuinely wrong, change eslint.config.js and say so in the commit message.",
            })
          }
        }
      },
    }
  },
}

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "site/dist/**",
      "packages/prui/dist/**",
      "prototypes/**",
      "examples/*/dist/**",
    ],
  },
  // Defense in depth alongside the ban above: a stale disable directive is
  // itself an error, so nothing can silently suppress a rule and rot.
  { linterOptions: { reportUnusedDisableDirectives: "error" } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Set-state-on-prop-change effects and dnd-kit's render hooks are
      // established patterns in this codebase; the compiler-era rules
      // flag both. Revisit when the codebase adopts the React compiler.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  // Anti-cheat for agents: no inline rule disables in consumer code (site,
  // examples) — the surfaces agents generate UI on. Library internals may
  // keep justified disables (they carry rationale comments and are covered
  // by tests); ambient *.d.ts files cannot carry runtime code, so they are
  // exempt too. A rule that is genuinely wrong gets changed in
  // eslint.config.js in a reviewed commit, never silenced in place.
  {
    files: ["site/src/**/*.{ts,tsx}", "examples/*/src/**/*.{ts,tsx}"],
    ignores: ["**/*.d.ts"],
    plugins: { local: { rules: { "no-inline-disables": noInlineDisables } } },
    rules: {
      "local/no-inline-disables": "error",
    },
  },
  // Design-system lint: governs how consumers (site, examples) USE prui.
  // Library source (packages/prui/src) is deliberately not linted by these
  // rules: there, arbitrary var(--prui-*) values ARE the token mechanism.
  {
    files: ["site/src/**/*.{ts,tsx}", "examples/*/src/**/*.{ts,tsx}"],
    plugins: { shadcn },
    settings: {
      shadcn: {
        componentImports: ["^@skiddph/prui(/|$)", "^prui(/|$)"],
        note: "PRUI design-system rule: fix with component props, variants, or prui tokens — never by disabling rules, raw HTML controls, or inline styles. See AGENTS.md.",
      },
    },
    rules: {
      "shadcn/no-restyle": [
        "error",
        {
          // Pages control placement and flow; components own their skin.
          // Color is only allowed where no-raw-colors still vetoes palette
          // colors — layered enforcement, not a hole.
          allow: ["layout"],
          contracts: [
            // Cards are content containers: pages may adjust flow, spacing,
            // typography, and token-bound colors inside them.
            {
              pattern: "^(Card|CardHeader|CardContent|CardFooter)$",
              allow: ["layout", "spacing", "typography", "color"],
              message: "Cards are content containers: layout, spacing, typography, and token colors are allowed; the card's own surface/shape is not.",
            },
            {
              pattern: "^(CardTitle|CardDescription)$",
              allow: ["layout", "typography", "color"],
              message: "Titles may re-scale typography and use token colors (text-[var(--prui-…)]); palette colors are still banned.",
            },
            // Label/Alert display content: typography may re-scale.
            {
              pattern: "^(Label|Alert)$",
              allow: ["layout", "typography"],
            },
            // Inputs accept typography (e.g. font-mono for token values);
            // their height/padding stays with the size system. input-mono
            // is the site's compact-mono affordance (index.css), allowed by
            // exact name so classification never depends on the Tailwind
            // worker's availability.
            {
              pattern: "^(Input|Textarea|Select|Combobox)$",
              allow: ["layout", "typography", "input-mono"],
            },
            // ScrollArea is a layout primitive: size it like a box,
            // border it with token colors.
            {
              pattern: "^(ScrollArea|Surface)$",
              allow: ["layout", "spacing", "shape", "color"],
            },
            // Button gets an explicit vocabulary because it is the most
            // restyled component in agent output.
            {
              pattern: "^Button$",
              allow: ["layout"],
              message: {
                spacing: "Button owns its padding. Use size (sm, md, lg, icon) and control space with margins on the Button or gap on the parent.",
                color: "Button owns its colors. Use variant (primary, secondary, neutral, ghost, danger, success, warning, outline, soft, link), not color classes.",
                default: "Button owns its skin. Layout classes (mt-*, w-full, flex …) are fine; everything else is a variant or size prop.",
              },
            },
          ],
          message: {
            spacing: "This component owns its padding: use its size prop or put the spacing on the parent.",
            typography: "This component owns its typography: check its props before overriding text styles.",
            color: "PRUI components own their colors. Use surface/variant props, not color classes.",
            default: "PRUI components own their styling. Build with props and variants; layout classes (mt-*, w-full, flex …) are fine.",
          },
        },
      ],
      "shadcn/no-raw-colors": [
        "error",
        {
          message: "Raw palette colors break PRUI theming. Use prui tokens (*-[var(--prui-…)]) or a component variant.",
        },
      ],
      "shadcn/no-inline-styles": [
        "error",
        {
          message: "Inline styles bypass the PRUI design system. Use component props, variants, or classes with prui tokens.",
        },
      ],
      "shadcn/require-static-classes": [
        "error",
        {
          message: "Dynamic class strings (bg-${color}) cannot be checked or themed. Write classes statically, or drive them with a component prop.",
        },
      ],
      // `unstyled` is the library's internal escape hatch; consumers
      // reaching for it are almost always fighting the component instead
      // of using its props.
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='unstyled']",
          message: "The unstyled prop is reserved for library internals. Build with the component's props and variants instead.",
        },
      ],
    },
  },
  // Site is the one Tailwind v4 consumer: arbitrary values and unknown
  // classes are checked there only. Examples ship prui's compiled CSS and
  // plain CSS, so Tailwind semantics do not apply to them.
  {
    files: ["site/src/**/*.{ts,tsx}"],
    rules: {
      "shadcn/no-arbitrary-values": [
        "error",
        {
          // Token references are the sanctioned escape (verified against the
          // matcher: `*-[var(--prui-*` allows any utility bound to a prui
          // token, under any variant prefix); any other one-off value
          // (p-[13px], text-[27px]) is a design-system break.
          allow: ["*-[var(--prui-*"],
          message: "Arbitrary values break the PRUI scale. Use a named scale/token class (see site/src/index.css @theme) or a prui token: *-[var(--prui-…)].",
        },
      ],
      "shadcn/no-unknown-classes": [
        "error",
        {
          // Site-defined CSS classes and @theme utilities: known to the app
          // but not to Tailwind's defaults, and therefore invisible to the
          // plugin's fallback grammar when its Tailwind worker cannot build
          // the theme (cold CI runners). Exact names (not wildcards, except
          // the CSS-class families) keep typo detection for real utilities:
          // text-heroo or max-w-sit still fail.
          allow: [
            "prui-*",
            "toc-*",
            "grid-*",
            "input-mono",
            "text-micro",
            "text-caption",
            "text-lede",
            "text-title",
            "text-hero",
            "max-w-site",
            "max-w-wide",
            "max-w-content",
            "max-w-read",
            "min-h-hero",
            "min-h-hero-sm",
          ],
          message: "This class does not exist in the Tailwind theme or PRUI tokens — check the spelling, or define it in site/src/index.css.",
        },
      ],
    },
  },
  // Value-driven styles only. These four files set styles from runtime
  // measurements or data (measured code-block height, the iframe height
  // prop, token swatches from a data table, dnd-kit transforms). The
  // property list stays narrow: static styling remains banned everywhere,
  // including inside these files.
  {
    files: [
      "site/src/components/CodeView.tsx",
      "site/src/components/IframePortal.tsx",
      "site/src/pages/Theming.tsx",
      "site/src/pages/designer/NavEditor.tsx",
    ],
    rules: {
      "shadcn/no-inline-styles": [
        "error",
        { allow: ["height", "background", "transform", "transition", "opacity"] },
      ],
    },
  },
  {
    files: ["**/scripts/**/*.{js,mjs}", "scripts/**/*.{js,mjs}", "**/packages/cli/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
)
