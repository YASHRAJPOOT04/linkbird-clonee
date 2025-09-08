// Mock database for development - no external dependencies needed
import * as schema from "./schema";

// Create a mock database interface
interface MockDatabase {
  users: Map<string, any>;
  sessions: Map<string, any>;
  accounts: Map<string, any>;
  verificationTokens: Map<string, any>;
  campaigns: Map<string, any>;
  leads: Map<string, any>;
}

const mockDb: MockDatabase = {
  users: new Map(),
  sessions: new Map(),
  accounts: new Map(),
  verificationTokens: new Map(),
  campaigns: new Map(),
  leads: new Map(),
};

// Mock drizzle-like interface
export const db = {
  select: () => ({
    from: (table: any) => ({
      where: () => ({ limit: () => [] }),
    }),
  }),
  insert: (table: any) => ({
    values: (data: any) => {
      const id = data.id || Math.random().toString(36);
      if (table === schema.users) {
        mockDb.users.set(id, { ...data, id });
      } else if (table === schema.sessions) {
        mockDb.sessions.set(id, { ...data, id });
      } else if (table === schema.accounts) {
        mockDb.accounts.set(id, { ...data, id });
      } else if (table === schema.campaigns) {
        mockDb.campaigns.set(id, { ...data, id });
      } else if (table === schema.leads) {
        mockDb.leads.set(id, { ...data, id });
      }
      return { returning: () => [{ ...data, id }] };
    },
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: () => ({ returning: () => [data] }),
    }),
  }),
  delete: (table: any) => ({
    where: () => ({ returning: () => [] }),
  }),
  query: {
    users: {
      findFirst: async (options: any) => {
        const users = Array.from(mockDb.users.values());
        return users.find((user) => {
          if (options.where) {
            // Simple email matching for mock
            return user.email === options.where.email;
          }
          return users[0];
        }) || null;
      },
      findMany: async () => Array.from(mockDb.users.values()),
    },
    sessions: {
      findFirst: async (options: any) => {
        const sessions = Array.from(mockDb.sessions.values());
        return sessions.find((session) => {
          if (options.where) {
            return session.token === options.where.token;
          }
          return sessions[0];
        }) || null;
      },
    },
    campaigns: {
      findMany: async () => Array.from(mockDb.campaigns.values()),
    },
    leads: {
      findMany: async () => Array.from(mockDb.leads.values()),
    },
  },
};

console.log("Mock database initialized for development");