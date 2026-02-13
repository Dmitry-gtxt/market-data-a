import { z } from "zod";

export const ErrorCode = z.enum([
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "NOT_IMPLEMENTED",
  "INTERNAL",
  "UNSUPPORTED",
]);

export type ErrorCode = z.infer<typeof ErrorCode>;

export const ErrorBodySchema = z.object({
  code: ErrorCode,
  message: z.string(),
  details: z.unknown().optional(),
});

export type ErrorBody = z.infer<typeof ErrorBodySchema>;
