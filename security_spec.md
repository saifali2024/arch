# Firestore Security Specifications

## 1. Data Invariants
- Each document in `/records` must have an ID of format `${ministry}-${departmentName}-${year}-${month}` to avoid duplication.
- Every record must have positive numeric or zero values for `employeeCount`, `totalSalaries`, `deduction10`, `deduction15`, and `deduction25`.
- Users inside `/users` must have a valid non-empty `username` and `role` (either 'admin' or 'user').

## 2. The Dirty Dozen Payloads (Targeted Malicious Requests)
1. **Empty ID Poisoning**: Trying to submit a record without a valid composite ID.
2. **Negative Salary Injection**: Trying to submit a negative number for `totalSalaries`.
3. **Negative Employee Count**: Trying to set `employeeCount` to `-5`.
4. **Invalid Role Injection**: Attempting to create a user with `role: "superuser"`.
5. **Ghost Field Update**: Adding random fields to a record.
6. **Incorrect Type**: Submitting a string for `year`.
7. **Junk ID Poisoning**: Submitting excessively long strings as ID.
8. **Invalid Permissions Pattern**: Creating permissions with unlisted flags.
9. **Duplicate Prevention**: Intercepting and breaking composite key constraints.
10. **Zero Employee Invariant**: Sending an institutional salary with zero employees but positive totals.
11. **Immutability Breach**: Overwriting `submittedAt` to an arbitrary historical date.
12. **Malformed Attachments**: Uploading attachments structure without appropriate name/type/data template.

## 3. Test Runner
Secure schema verification is implemented natively in `firestore.rules`.
