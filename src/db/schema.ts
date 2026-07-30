import { pgTable, serial, varchar, text, integer, real, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 32 }).notNull(),
  taskLabel: varchar("task_label", { length: 128 }).notNull(),
  bandScore: real("band_score").notNull(),
  rawScore: integer("raw_score"),
  totalQuestions: integer("total_questions"),
  userResponse: text("user_response").notNull(),
  feedback: jsonb("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listeningTests = pgTable("listening_tests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  intro: text("intro").notNull(),
  transcript: text("transcript").notNull(),
  questions: jsonb("questions").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readingTests = pgTable("reading_tests", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  passage: text("passage").notNull(),
  questions: jsonb("questions").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const writingTasks = pgTable("writing_tasks", {
  id: serial("id").primaryKey(),
  taskNumber: integer("task_number").notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  prompt: text("prompt").notNull(),
  minWords: integer("min_words").notNull(),
  timeMinutes: integer("time_minutes").notNull(),
  dataDescription: text("data_description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const speakingPrompts = pgTable("speaking_prompts", {
  id: serial("id").primaryKey(),
  part: integer("part").notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  prompt: text("prompt"),
  questions: jsonb("questions"),
  timeMinutes: integer("time_minutes").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// App settings table (e.g. Gemini API key stored securely in DB)
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type ListeningTestRow = typeof listeningTests.$inferSelect;
export type ReadingTestRow = typeof readingTests.$inferSelect;
export type WritingTaskRow = typeof writingTasks.$inferSelect;
export type SpeakingPromptRow = typeof speakingPrompts.$inferSelect;
