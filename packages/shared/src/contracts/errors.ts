import { z } from "zod";

export const ErrorCodeSchema = z.enum([
  "VALIDATION_ERROR",
  "RATE_LIMITED",
  "NOT_IMPLEMENTED",
  "INTERNAL",
  "UNSUPPORTED",
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorBodySchema = z.object({
  code: ErrorCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
});

export type ErrorBody = z.infer<typeof ErrorBodySchema>;
