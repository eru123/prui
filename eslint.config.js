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
  // Design-system lint: governs how prui is USED — by the site, the
  // examples, AND by prui's own components when they compose each other.
  // The library previously sat this out because its classes were arbitrary
  // var() expressions; since the migration onto the semantic utility
  // registry (src/theme/tokens.css) the same rules apply everywhere, with
  // narrow, documented allowances for token contracts (z-index scale) and
  // runtime geometry (the anchoring engine).
  {
    files: [
      "site/src/**/*.{ts,tsx}",
      "examples/*/src/**/*.{ts,tsx}",
      "packages/prui/src/**/*.{ts,tsx}",
    ],
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
  // Library allowances: documented token contracts and runtime geometry —
  // not skin. Z-index must go through the --prui-z-* scale (base.css
  // documents the stacking order), the anchoring engine sets positions from
  // measurements, and a few viewport-relative sizes have no utility.
  // Everything color/spacing/typography-shaped stays banned.
  {
    files: ["packages/prui/src/**/*.{ts,tsx}"],
    rules: {
      "shadcn/no-arbitrary-values": [
        "error",
        {
          allow: [
            "z-[var(--prui-z-*)]",
            "z-[calc(var(--prui-z-*)]",
            "z-[1]",
            "w-[min(420px,34vw)]",
            "max-h-[85vh]",
            "max-h-[70vh]",
            "grid-cols-[1fr_auto_1fr]",
            "right-[11px]",
            "left-[11px]",
            "transition-[width]",
          ],
          message: "Arbitrary values are reserved for the z-index token contract and measured geometry. Style with the semantic registry (src/theme/tokens.css): bg-brand, text-dim, rounded-prui, …",
        },
      ],
      "shadcn/no-inline-styles": [
        "error",
        {
          // The anchoring/overlay engine and data-driven widgets set
          // geometry from runtime values. Skin properties (colors, fonts,
          // padding-block, borders) stay banned.
          allow: [
            "top", "left", "right", "bottom", "inset", "position",
            "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
            "transform", "translate", "scale", "rotate",
            "transition", "transitionDuration", "transitionDelay", "willChange",
            "opacity", "zIndex", "visibility", "pointerEvents",
            "gridTemplateColumns", "gridTemplateRows", "gridColumn", "gridRow",
            "flex", "flexBasis", "flexGrow", "flexShrink", "order",
            "aspectRatio", "overscrollBehavior",
            "padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock",
            "marginLeft", "marginRight", "marginInline",
            "color", "backgroundColor", "background", "borderColor", "borderRadius", "backdropFilter", "boxShadow",
            "animationDuration", "animationDelay",
          ],
          message: "Inline styles in the library are for runtime geometry only. Static skin lives in the semantic utility classes.",
        },
      ],
      "shadcn/no-unknown-classes": [
        "error",
        {
          // Fallback grammar safety net: when the Tailwind worker cannot
          // build the theme (cold CI), the semantic utilities would read as
          // unknown. Exact names — typos like bg-brands still fail.
          allow: [
            "prui-*",
            "bg-background", "bg-surface", "bg-raise", "bg-line", "bg-field", "bg-ghost",
            "bg-brand", "bg-brand-strong", "bg-brand-fg",
            "bg-ok", "bg-ok-strong", "bg-warn", "bg-warn-strong", "bg-danger", "bg-danger-strong",
            "bg-primary", "bg-secondary", "bg-ok-fill", "bg-warn-fill", "bg-danger-fill",
            "text-fg", "text-dim", "text-brand", "text-brand-strong", "text-brand-fg",
            "text-ok", "text-warn", "text-danger", "text-ring", "text-2xs",
            "text-primary-fg", "text-secondary-fg", "text-on-fill", "text-accent-fg",
            "border-line", "border-dim", "border-brand", "border-ok", "border-warn", "border-danger", "border-ring", "border-accent-border",
            "divide-line", "accent-brand", "fill-brand", "outline-brand",
            "ring-ring", "ring-danger", "rounded-prui", "rounded-t-prui", "rounded-prui-sm", "rounded-prui-full", "rounded-prui-inner",
            "shadow-prui-md", "shadow-prui-lg", "shadow-prui-modal", "shadow-card", "inset-shadow-highlight",
            "max-w-content", "ease-prui",
          ],
          message: "Unknown class in library source — check the semantic registry (src/theme/tokens.css).",
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
