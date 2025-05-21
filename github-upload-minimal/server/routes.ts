import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTimeEntrySchema } from "@shared/schema";
import { z } from "zod";
import { authenticate, login, register } from "./auth";
import ExcelJS from 'exceljs';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";
  
  // Authentication routes
  app.post(`${apiPrefix}/auth/register`, register);
  app.post(`${apiPrefix}/auth/login`, login);
  
  // Time entry routes
  app.get(`${apiPrefix}/time-entries`, async (req: Request, res: Response) => {
    try {
      // Parse query parameters
      const querySchema = z.object({
        userId: z.coerce.number(),
        year: z.coerce.number(),
        month: z.coerce.number(),
      });
      
      const query = querySchema.safeParse(req.query);
      
      if (!query.success) {
        return res.status(400).json({ message: "Invalid query parameters", errors: query.error.format() });
      }
      
      const { userId, year, month } = query.data;
      
      // Get time entries for the user and month
      const entries = await storage.getTimeEntriesByUserAndMonth(userId, year, month);
      
      return res.json(entries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      return res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });
  
  // Get entry by ID
  app.get(`${apiPrefix}/time-entries/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      const entry = await storage.getTimeEntry(id);
      
      if (!entry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      return res.json(entry);
    } catch (error) {
      console.error("Error fetching time entry:", error);
      return res.status(500).json({ message: "Failed to fetch time entry" });
    }
  });
  
  // Get entry by date and user ID
  app.get(`${apiPrefix}/time-entries/date/:date`, async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      // Parse query parameters for userId
      const querySchema = z.object({
        userId: z.coerce.number(),
      });
      
      const query = querySchema.safeParse(req.query);
      
      if (!query.success) {
        return res.status(400).json({ message: "Invalid query parameters", errors: query.error.format() });
      }
      
      const { userId } = query.data;
      
      // Get the time entry
      const entry = await storage.getTimeEntryByDate(userId, date);
      
      if (!entry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      return res.json(entry);
    } catch (error) {
      console.error("Error fetching time entry by date:", error);
      return res.status(500).json({ message: "Failed to fetch time entry" });
    }
  });
  
  // Create a new entry
  app.post(`${apiPrefix}/time-entries`, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertTimeEntrySchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid time entry data", errors: validatedData.error.format() });
      }
      
      // Check if entry for this date already exists
      const existingEntry = await storage.getTimeEntryByDate(validatedData.data.userId, validatedData.data.date);
      
      if (existingEntry) {
        return res.status(409).json({ message: "Time entry for this date already exists" });
      }
      
      // Create the time entry
      const newEntry = await storage.createTimeEntry(validatedData.data);
      
      return res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      return res.status(500).json({ message: "Failed to create time entry" });
    }
  });
  
  // Update an entry
  app.put(`${apiPrefix}/time-entries/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      // Validate request body (allowing partial updates)
      const validatedData = insertTimeEntrySchema.partial().safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid time entry data", errors: validatedData.error.format() });
      }
      
      // Update the time entry
      const updatedEntry = await storage.updateTimeEntry(id, validatedData.data);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      return res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating time entry:", error);
      return res.status(500).json({ message: "Failed to update time entry" });
    }
  });
  
  // Delete an entry
  app.delete(`${apiPrefix}/time-entries/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid time entry ID" });
      }
      
      const deleted = await storage.deleteTimeEntry(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      return res.status(500).json({ message: "Failed to delete time entry" });
    }
  });
  
  // Export monthly time entries to Excel
  app.get(`${apiPrefix}/export/month`, async (req: Request, res: Response) => {
    try {
      // Parse query parameters
      const querySchema = z.object({
        userId: z.coerce.number(),
        year: z.coerce.number(),
        month: z.coerce.number(),
      });
      
      const query = querySchema.safeParse(req.query);
      
      if (!query.success) {
        return res.status(400).json({ message: "Invalid query parameters", errors: query.error.format() });
      }
      
      const { userId, year, month } = query.data;
      
      // Get time entries for the user and month
      const entries = await storage.getTimeEntriesByUserAndMonth(userId, year, month);
      
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('시간 기록');
      
      // Add column headers
      worksheet.columns = [
        { header: '날짜', key: 'date', width: 15 },
        { header: '근무 유형', key: 'workType', width: 15 },
        { header: '출근 시간', key: 'checkinTime', width: 15 },
        { header: '퇴근 시간', key: 'checkoutTime', width: 15 },
        { header: '연차 (시간)', key: 'annualLeaveHours', width: 15 },
        { header: '시간차 (시간)', key: 'hourlyLeave', width: 15 },
        { header: '외출 시간 (분)', key: 'outsideTime', width: 15 },
        { header: '석식 신청', key: 'dinnerMeal', width: 15 },
        { header: '총 근무 시간', key: 'totalHours', width: 15 }
      ];
      
      // Prepare data rows
      const workTypeLabels: Record<string, string> = {
        'office': '사무실',
        'remote': '재택',
        'annual-leave': '연차'
      };
      
      const rows = entries.map(entry => ({
        date: entry.date,
        workType: workTypeLabels[entry.workType] || entry.workType,
        checkinTime: entry.checkinTime || '-',
        checkoutTime: entry.checkoutTime || '-',
        annualLeaveHours: entry.annualLeaveHours || 0,
        hourlyLeave: entry.hourlyLeave || 0,
        outsideTime: entry.outsideTime || 0,
        dinnerMeal: entry.dinnerMeal ? '예' : '아니오',
        totalHours: entry.totalHours / 60 // Convert from stored minutes to hours
      }));
      
      // Add rows to worksheet
      worksheet.addRows(rows);
      
      // Set headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=time-entries-${year}-${month}.xlsx`);
      
      // Write to response
      await workbook.xlsx.write(res);
      
    } catch (error) {
      console.error("Error exporting time entries:", error);
      return res.status(500).json({ message: "Failed to export time entries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
