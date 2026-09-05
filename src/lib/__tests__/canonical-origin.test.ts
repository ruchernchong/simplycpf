describe("canonical brand origin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
  it("uses the apex domain in production without a configured origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_URL", "preview.vercel.app");
    vi.resetModules();
    expect((await import("@/config")).BASE_URL).toBe("https://simplycpf.com");
  });
  it("normalises an explicitly configured origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://simplycpf.com/");
    vi.resetModules();
    expect((await import("@/config")).BASE_URL).toBe("https://simplycpf.com");
  });
  it("uses the Portless URL during local development", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PORTLESS_URL", "https://simplycpf.localhost");
    vi.resetModules();
    expect((await import("@/config")).BASE_URL).toBe(
      "https://simplycpf.localhost",
    );
  });
  it("retains the localhost development fallback", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PORTLESS_URL", "");
    vi.resetModules();
    expect((await import("@/config")).BASE_URL).toBe("http://localhost:3000");
  });
});
