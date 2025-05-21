import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// TimeEntry schema for time management
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  workType: text("work_type").notNull(), // 'office', 'remote', 'annual-leave'
  checkinTime: text("checkin_time"),
  checkoutTime: text("checkout_time"),
  annualLeaveHours: integer("annual_leave_hours").default(0),
  hourlyLeave: integer("hourly_leave").default(0), // in hours
  outsideTime: integer("outside_time").default(0), // in minutes
  dinnerMeal: boolean("dinner_meal").default(false),
  totalHours: integer("total_hours").notNull(), // stored as minutes (totalHours * 60)
  rawHours: integer("raw_hours"), // stored as minutes
  breakDeduction: integer("break_deduction"), // stored as minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
