declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    LEAD_EMAIL_ENABLED?: string;
    BUCKET?: R2Bucket;
  }
}
