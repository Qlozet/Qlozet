import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().refine((val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, { message: "Invalid URL format" }).default(
      process.env.NEXT_PUBLIC_BASE_URL ?? ""
    ),
    NEXT_PUBLIC_USE_SHADCN_BUTTON: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .default(false),
    NEXT_PUBLIC_USE_SHADCN_SEARCH: z
      .boolean()
      .default(false)
      .describe("Enable ShadCN search components"),
    NEXT_PUBLIC_USE_SHADCN_MODAL: z
      .boolean()
      .default(false)
      .optional(),
    NEXT_PUBLIC_USE_SHADCN_TYPOGRAPHY: z
      .boolean()
      .default(false)
  },
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_USE_SHADCN_BUTTON: process.env.NEXT_PUBLIC_USE_SHADCN_BUTTON,
    NEXT_PUBLIC_USE_SHADCN_SEARCH: process.env.NEXT_PUBLIC_USE_SHADCN_SEARCH,
    NEXT_PUBLIC_USE_SHADCN_MODAL: process.env.NEXT_PUBLIC_USE_SHADCN_MODAL,
    NEXT_PUBLIC_USE_SHADCN_TYPOGRAPHY: process.env.NEXT_PUBLIC_USE_SHADCN_TYPOGRAPHY
  }
});