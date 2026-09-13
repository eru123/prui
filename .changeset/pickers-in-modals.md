---
"@skiddph/prui": patch
---

Date/time picker popovers open above modals.

The calendar and time popovers rendered at the overlay layer (z 50), under the modal overlay (z 10000) — a DatePicker inside a Resource create/edit modal opened its calendar unclickably behind the scrim. Popovers now render just above the modal layer (toasts and confirms still stack above them).
