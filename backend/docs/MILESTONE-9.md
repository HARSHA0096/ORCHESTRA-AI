
## Release fix: buildApp portability

Added an explicit portable `FastifyInstance<any, any, any, any>` return type to the gateway `buildApp()` factory. This prevents TypeScript TS2742 from exposing a nested workspace Pino type in the inferred public function type.
