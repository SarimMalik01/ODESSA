export function normalizePath(
    rawPath?: string | null,
    workspacePath?: string
  ): string | undefined {
    if (!rawPath) return undefined;
  
    // 1️⃣ Normalize slashes first
    let p = rawPath.replace(/\\/g, "/");
  
    // 2️⃣ Normalize workspacePath
    const ws = workspacePath?.replace(/\\/g, "/");
  
    // 3️⃣ Strip everything BEFORE workspacePath
    if (ws) {
      const idx = p.indexOf(ws);
      if (idx !== -1) {
        p = p.slice(idx);
      }
    }
  
    // 4️⃣ Collapse duplicate slashes
    p = p.replace(/\/+/g, "/");
  
    // 5️⃣ Remove trailing slash (except root)
    if (p.length > 1 && p.endsWith("/")) {
      p = p.slice(0, -1);
    }
  
    return p;
  }

