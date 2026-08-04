# DECISIONS.md — Vibe Coding Challenge

## 1. What did AI generate for you, and what did you write or modify yourself?

**AI (Cursor) generated most of the initial implementation scaffolding**, including:

- Clean Architecture project layout and DI wiring
- Domain entities/enums, Application DTOs/services/FluentValidation validators
- EF Core `DbContext`, migration, seed data, JWT auth service
- API controllers and Angular track list/detail pages

**I directed and reviewed the design decisions myself**, including:

- Choosing Clean Architecture boundaries (Domain → Application → Infrastructure → API)
- Choosing SQLite for zero-setup local demo instead of SQL Server
- Protecting **write** distribution endpoints with JWT (`distribute`, `status`) while keeping catalog reads open for the Angular UI
- Domain rules: cannot distribute a draft track; cannot mark `Distributed` without at least one DSP submission; unique ISRC enforcement
- Removing the unused/vulnerable OpenAPI packages from the API project
- Reviewing validation messages, CORS origins, and README/JWT docs for assessor usability
- Writing this `DECISIONS.md` honestly about what AI did vs what I enforced

In short: AI accelerated boilerplate and wiring; I owned architecture choices, business rules, security hardening, and documentation quality.

## 2. What security issues did you find (or introduce) in the AI-generated code? How did you handle them?

| Issue | Risk | Handling |
|---|---|---|
| Hardcoded demo login (`admin` / `Admin@123`) | Acceptable for assessment, unsafe for production | Kept for demo only; documented clearly in README; not presented as production auth |
| JWT signing key in `appsettings.json` | Key leakage if repo is public | Enforced minimum key length (32+), documented that it must be rotated/moved to secrets for real deployments |
| Over-permissive CORS (`AllowAnyOrigin`) often suggested by AI | CSRF-ish abuse from any site | Restricted CORS to `http(s)://localhost:4200` only |
| Missing auth on mutate endpoints | Anyone could distribute tracks / change status | Added `[Authorize]` on `POST .../distribute` and `PATCH .../status` |
| SQLite native package advisory on older transitive versions | Known vulnerability warning | Bumped `SQLitePCLRaw.bundle_e_sqlite3` to `2.1.12` |
| OpenAPI package advisory (`Microsoft.OpenApi`) | Supply-chain warning; not required by the task | Removed OpenAPI packages/endpoints from the API project |
| Trusting client-sent status/DSP ids blindly | Invalid transitions / fake DSP submissions | Added FluentValidation + server-side existence checks and business-rule guards |

## 3. One thing the AI got wrong that you had to fix. What was it and why was it wrong?

**AI initially registered FluentValidation with `AddValidatorsFromAssemblyContaining<DependencyInjection>()`**, where `DependencyInjection` was a `static` class.

That does not compile in C# (`CS0718`: static types cannot be used as type arguments). It is a common AI slip: treating a static DI helper as a marker type.

**Fix:** register validators with a real non-static type from the Application assembly:

```csharp
services.AddValidatorsFromAssemblyContaining<CreateArtistRequestValidator>();
```

This matters because it shows the need to compile/run AI output rather than trust it blindly — a static marker type looks “clean” but is invalid C#.
