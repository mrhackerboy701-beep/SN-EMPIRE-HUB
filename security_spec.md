# Security Specification
## Data Invariants
1. A User can only be created by the matching authenticated uid.
2. A User profile's `role` and `subscriptionStatus` can only be modified by an Admin.
3. A Payment can only be created by the user referenced in `userId`, and only admins can update the payment status to `approved` or `rejected`.
4. Only admins can create/update/delete Plans.
5. Only admins can update Settings, but anyone can read global settings.

## The "Dirty Dozen" Payloads
1. User creates profile with `role: "admin"` -> DENIED
2. User creates profile for different uid -> DENIED
3. User modifies their own `walletBalance` -> DENIED
4. User queries all payments (not just theirs) -> DENIED
5. User creates a Payment for another `userId` -> DENIED
6. User modifies Payment status to `approved` -> DENIED
7. User modifies a Plan -> DENIED
8. User creates a new Plan -> DENIED
9. User updates global Settings -> DENIED
10. Unauthenticated user reads Payments -> DENIED
11. User deletes a Payment -> DENIED
12. User creates Payment with invalid length status -> DENIED
