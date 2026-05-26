# Project Structure

This project now follows the same broad structure as `ixartz/Next-js-Boilerplate`: app source code lives in `src/`, shared UI and utilities are split into top-level source folders, and root-level files are reserved for configuration.

Reference: https://github.com/ixartz/Next-js-Boilerplate

## Layout

```txt
.
├── README.md
├── public/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                # Next.js App Router routes and route handlers
│   │   ├── (app)/          # authenticated application routes
│   │   ├── (auth)/         # login/setup routes
│   │   └── api/            # API route handlers
│   ├── components/         # reusable React components
│   │   └── ui/             # UI primitives
│   ├── constants/          # shared constants
│   ├── generated/          # generated Prisma Client, gitignored
│   ├── libs/               # third-party/library configuration
│   ├── styles/             # global styles
│   ├── templates/          # page/layout templates
│   ├── types/              # shared TypeScript types
│   ├── utils/              # utility functions
│   └── validations/        # Zod validation schemas
├── tests/                  # add tests here when introduced
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Conventions

- Put route files and route handlers in `src/app`.
- Put reusable components in `src/components`.
- Put app shells and large layout templates in `src/templates`.
- Put external service setup in `src/libs`, for example Prisma.
- Put reusable schemas in `src/validations`.
- Put helper functions in `src/utils`.
- Keep generated Prisma Client in `src/generated/prisma`.
- Keep config files at the project root.
