export const DEFAULT_ARCH_CONFIG = {
    layers: [
      { name: "ui", path: "/ui/" },
      { name: "service", path: "/service/" },
      { name: "domain", path: "/domain/" },
      { name: "core", path: "/core/" }
    ],
    rules: {
      direction: ["ui", "service", "domain", "core"],
      godModule: {
        maxFanOut: 7,
        maxFanIn: 10
      },
      instability: {
        stableThreshold: 0.3,
        unstableThreshold: 0.7
      }
    }
  };
  