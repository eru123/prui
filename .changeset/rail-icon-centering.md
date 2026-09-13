---
"@skiddph/prui": patch
---

Collapsed rail: leaf nav links center their icons too.

The rail's justify-content:center rule only matched group toggle buttons; leaf items render as router links (<a>), so their icons sat 6px left of the rail's center axis. The rule now covers both, with padding-inline reset — collapsed rail icons and mono initials all center, and the expanded sidebar keeps its left-aligned rows.
