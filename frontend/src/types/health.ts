export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  environment: string;
  details?: {
    service?: string;
    version?: string;
    javaVersion?: string;
    database?: string;
    databaseError?: string;
    [key: string]: unknown;
  };
}
