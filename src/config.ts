const requiredEnv = [
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_USE_MOCK_API",
  "NEXT_PUBLIC_OFFICE_QR_CODE"
] as const;

type RequiredKey = (typeof requiredEnv)[number];

type PublicConfig = {
  appName: string;
  useMockApi: boolean;
  apiBaseUrl: string;
  officeQrCode: string;
};

const isServer = typeof window === "undefined";

const getEnvValue = (key: RequiredKey, value: string | undefined) => {
  if (!value) {
    const message = `Missing required env var: ${key}. Add it to your .env.local.`;
    if (isServer) {
      throw new Error(message);
    }
    if (process.env.NODE_ENV !== "production") {
      console.error(message);
    }
    return "";
  }
  return value;
};

export const config: PublicConfig = {
  appName: getEnvValue(
    "NEXT_PUBLIC_APP_NAME",
    process.env.NEXT_PUBLIC_APP_NAME
  ),
  useMockApi:
    getEnvValue(
      "NEXT_PUBLIC_USE_MOCK_API",
      process.env.NEXT_PUBLIC_USE_MOCK_API
    ) === "true",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  officeQrCode: getEnvValue(
    "NEXT_PUBLIC_OFFICE_QR_CODE",
    process.env.NEXT_PUBLIC_OFFICE_QR_CODE
  )
};

if (!config.useMockApi && !config.apiBaseUrl && isServer) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is required when NEXT_PUBLIC_USE_MOCK_API is false."
  );
}
