import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Set up monthly data cleanup on the 15th of each month
  // Function to check if it's the 15th day and delete previous month's data
  async function checkAndCleanupData() {
    const now = new Date();
    const dayOfMonth = now.getDate();
    
    // Run cleanup on the 15th of each month
    if (dayOfMonth === 15) {
      try {
        // Calculate the first day of the previous month
        const previousMonth = new Date(now);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        previousMonth.setDate(1);
        previousMonth.setHours(0, 0, 0, 0);
        
        // Format date as YYYY-MM-DD for comparison
        const cutoffDate = previousMonth.toISOString().split('T')[0];
        
        // Delete all entries older than the cutoff date
        const deletedCount = await storage.deleteTimeEntriesOlderThan(cutoffDate);
        
        log(`Monthly cleanup: Deleted ${deletedCount} time entries from before ${cutoffDate}`);
      } catch (error) {
        console.error('Error during monthly data cleanup:', error);
      }
    }
  }
  
  // Check once a day at midnight
  setInterval(checkAndCleanupData, 24 * 60 * 60 * 1000);
  
  // Also run once at startup to check if cleanup should happen today
  checkAndCleanupData();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
