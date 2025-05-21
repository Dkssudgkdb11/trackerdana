import { users, type User, type InsertUser, TimeEntry, InsertTimeEntry, timeEntries } from "@shared/schema";
import { db } from "./db";
import { eq, and, between, sql } from "drizzle-orm";

// Modify the interface with all needed CRUD methods
export interface IStorage {
  // User methods (keeping original)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Time entry methods
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getTimeEntriesByUserAndMonth(userId: number, year: number, month: number): Promise<TimeEntry[]>;
  getTimeEntryByDate(userId: number, date: string): Promise<TimeEntry | undefined>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, entry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;
  deleteTimeEntriesOlderThan(date: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Time entry methods
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    const result = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return result[0];
  }
  
  async getTimeEntriesByUserAndMonth(userId: number, year: number, month: number): Promise<TimeEntry[]> {
    // Create date strings for the first and last day of the month
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0); // Last day of the month
    
    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
    const lastDayStr = lastDayOfMonth.toISOString().split('T')[0];
    
    const result = await db.select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          sql`${timeEntries.date} BETWEEN ${firstDayStr} AND ${lastDayStr}`
        )
      );
    
    return result;
  }
  
  async getTimeEntryByDate(userId: number, date: string): Promise<TimeEntry | undefined> {
    const result = await db.select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.userId, userId),
          eq(timeEntries.date, date)
        )
      );
    
    return result[0];
  }
  
  async createTimeEntry(insertEntry: InsertTimeEntry): Promise<TimeEntry> {
    // Convert floating point hours to integers (stored as minutes)
    const entryToInsert = {
      ...insertEntry,
      totalHours: Math.round(insertEntry.totalHours * 60),
      rawHours: insertEntry.rawHours ? Math.round(insertEntry.rawHours * 60) : null,
      breakDeduction: insertEntry.breakDeduction ? Math.round(insertEntry.breakDeduction * 60) : null
    };
    
    const result = await db.insert(timeEntries).values(entryToInsert).returning();
    
    // Convert minutes back to hours for the returned object
    const entry = {
      ...result[0],
      totalHours: result[0].totalHours / 60,
      rawHours: result[0].rawHours ? result[0].rawHours / 60 : null,
      breakDeduction: result[0].breakDeduction ? result[0].breakDeduction / 60 : null
    };
    
    return entry;
  }
  
  async updateTimeEntry(id: number, updateData: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    // Prepare the data for update, converting hours to minutes if present
    const dataToUpdate: Record<string, any> = { ...updateData };
    
    if (dataToUpdate.totalHours !== undefined) {
      dataToUpdate.totalHours = Math.round(dataToUpdate.totalHours * 60);
    }
    
    if (dataToUpdate.rawHours !== undefined) {
      dataToUpdate.rawHours = dataToUpdate.rawHours ? Math.round(dataToUpdate.rawHours * 60) : null;
    }
    
    if (dataToUpdate.breakDeduction !== undefined) {
      dataToUpdate.breakDeduction = dataToUpdate.breakDeduction ? Math.round(dataToUpdate.breakDeduction * 60) : null;
    }
    
    // Add updated timestamp
    dataToUpdate.updatedAt = new Date();
    
    const result = await db.update(timeEntries)
      .set(dataToUpdate)
      .where(eq(timeEntries.id, id))
      .returning();
    
    if (result.length === 0) {
      return undefined;
    }
    
    // Convert minutes back to hours for the returned object
    const entry = {
      ...result[0],
      totalHours: result[0].totalHours / 60,
      rawHours: result[0].rawHours ? result[0].rawHours / 60 : null,
      breakDeduction: result[0].breakDeduction ? result[0].breakDeduction / 60 : null
    };
    
    return entry;
  }
  
  async deleteTimeEntry(id: number): Promise<boolean> {
    const result = await db.delete(timeEntries)
      .where(eq(timeEntries.id, id))
      .returning({ id: timeEntries.id });
    
    return result.length > 0;
  }

  async deleteTimeEntriesOlderThan(date: string): Promise<number> {
    const result = await db.delete(timeEntries)
      .where(sql`${timeEntries.date} < ${date}`)
      .returning({ id: timeEntries.id });
    
    return result.length;
  }
}

// For memory storage fallback (for development)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private timeEntries: Map<number, TimeEntry>;
  currentUserId: number;
  currentTimeEntryId: number;

  constructor() {
    this.users = new Map();
    this.timeEntries = new Map();
    this.currentUserId = 1;
    this.currentTimeEntryId = 1;
  }

  // User methods (keeping original)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Time entry methods
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }
  
  async getTimeEntriesByUserAndMonth(userId: number, year: number, month: number): Promise<TimeEntry[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return Array.from(this.timeEntries.values()).filter(entry => {
      if (entry.userId !== userId) return false;
      
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }
  
  async getTimeEntryByDate(userId: number, date: string): Promise<TimeEntry | undefined> {
    return Array.from(this.timeEntries.values()).find(
      entry => entry.userId === userId && entry.date === date
    );
  }
  
  async createTimeEntry(insertEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.currentTimeEntryId++;
    const now = new Date();
    
    const entry: TimeEntry = {
      ...insertEntry,
      id,
      createdAt: now,
      updatedAt: now,
      // Ensure null vs undefined handling is consistent
      checkinTime: insertEntry.checkinTime || null,
      checkoutTime: insertEntry.checkoutTime || null,
      annualLeaveHours: insertEntry.annualLeaveHours || null,
      hourlyLeave: insertEntry.hourlyLeave || null,
      outsideTime: insertEntry.outsideTime || null,
      dinnerMeal: insertEntry.dinnerMeal || null,
      rawHours: insertEntry.rawHours || null,
      breakDeduction: insertEntry.breakDeduction || null,
    };
    
    this.timeEntries.set(id, entry);
    return entry;
  }
  
  async updateTimeEntry(id: number, updateData: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const existingEntry = this.timeEntries.get(id);
    
    if (!existingEntry) {
      return undefined;
    }
    
    const updatedEntry: TimeEntry = {
      ...existingEntry,
      ...updateData,
      updatedAt: new Date(),
      // Ensure null vs undefined handling is consistent
      checkinTime: updateData.checkinTime !== undefined ? updateData.checkinTime : existingEntry.checkinTime,
      checkoutTime: updateData.checkoutTime !== undefined ? updateData.checkoutTime : existingEntry.checkoutTime,
      annualLeaveHours: updateData.annualLeaveHours !== undefined ? updateData.annualLeaveHours : existingEntry.annualLeaveHours,
      hourlyLeave: updateData.hourlyLeave !== undefined ? updateData.hourlyLeave : existingEntry.hourlyLeave,
      outsideTime: updateData.outsideTime !== undefined ? updateData.outsideTime : existingEntry.outsideTime,
      dinnerMeal: updateData.dinnerMeal !== undefined ? updateData.dinnerMeal : existingEntry.dinnerMeal,
      rawHours: updateData.rawHours !== undefined ? updateData.rawHours : existingEntry.rawHours,
      breakDeduction: updateData.breakDeduction !== undefined ? updateData.breakDeduction : existingEntry.breakDeduction,
    };
    
    this.timeEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteTimeEntry(id: number): Promise<boolean> {
    return this.timeEntries.delete(id);
  }
  
  // Delete time entries older than the specified date
  async deleteTimeEntriesOlderThan(date: string): Promise<number> {
    let count = 0;
    const entriesToDelete: number[] = [];
    
    // Find entries older than the specified date
    for (const [id, entry] of this.timeEntries.entries()) {
      if (entry.date < date) {
        entriesToDelete.push(id);
        count++;
      }
    }
    
    // Delete the identified entries
    for (const id of entriesToDelete) {
      this.timeEntries.delete(id);
    }
    
    return count;
  }
}

// Export an instance of the proper storage implementation
export const storage = new DatabaseStorage();
