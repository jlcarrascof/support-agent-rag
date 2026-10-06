/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("cases", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    status: {
      type: "text",
      notNull: true,
      default: "open",
      check: "status IN ('open', 'resolved')",
    },
    resolved_at: { type: "timestamptz" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createTable("messages", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    case_id: {
      type: "uuid",
      notNull: true,
      references: "cases",
      onDelete: "cascade",
    },
    role: {
      type: "text",
      notNull: true,
      check: "role IN ('user', 'agent')",
    },
    content: { type: "text", notNull: true },
    tool_name: { type: "text" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createIndex("messages", "case_id");
};

exports.down = (pgm) => {
  pgm.dropTable("messages");
  pgm.dropTable("cases");
};
