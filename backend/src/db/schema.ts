import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
export const ROLES = ["USER", "ADMIN"] as const;
export const roleEnum = pgEnum("role", ROLES);
export const pollStatusEnum = pgEnum("poll_status", [
  "ACTIVE",
  "CLOSED",
  "PUBLISHED",
] as const);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }),
  email: varchar("email", { length: 322 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  password: varchar("password_hashed", { length: 300 }),

  avatar: text("user_avatar"),

  verificationToken: text("verification_token"),
  refreshToken: text("refresh_token"),

  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_token_expiry"),
  role: roleEnum().default(ROLES[0]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const pollsTable = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  creator_id: uuid("creator_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  status: pollStatusEnum().default("ACTIVE"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const questionsTable = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  poll_id: uuid("poll_id")
    .notNull()
    .references(() => pollsTable.id, { onDelete: "cascade" }),
  question_text: text("question_text").notNull(),
  isMandatory: boolean("is_mandatory").default(false).notNull(),
  order: integer("question_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const optionsTable = pgTable("options", {
  id: uuid("id").primaryKey().defaultRandom(),
  question_id: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  option_text: text("option_text").notNull(),
  order: integer("option_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const responsesTable = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    poll_id: uuid("poll_id")
      .notNull()
      .references(() => pollsTable.id, { onDelete: "cascade" }),
    submittedBy: uuid("submitted_by").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // unique poll_id to ensure one response per user per poll
  (table) => ({
    unique_response: unique("unique_response").on(
      table.poll_id,
      table.submittedBy
    ),
  })
);

export const response_answersTable = pgTable("response_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  response_id: uuid("response_id")
    .notNull()
    .references(() => responsesTable.id, { onDelete: "cascade" }),
  question_id: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  option_id: uuid("option_id")
    .notNull()
    .references(() => optionsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const pollsRelations = relations(pollsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [pollsTable.creator_id],
    references: [usersTable.id],
  }),
  questions: many(questionsTable),
}));

export const questionsRelations = relations(
  questionsTable,
  ({ one, many }) => ({
    poll: one(pollsTable, {
      fields: [questionsTable.poll_id],
      references: [pollsTable.id],
    }),
    options: many(optionsTable),
  })
);

export const optionsRelations = relations(optionsTable, ({ one }) => ({
  question: one(questionsTable, {
    fields: [optionsTable.question_id],
    references: [questionsTable.id],
  }),
}));
