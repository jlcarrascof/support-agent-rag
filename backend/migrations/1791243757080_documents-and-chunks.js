/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension("pgcrypto", { ifNotExists: true });

  pgm.createTable("documents", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    title: { type: "text", notNull: true },
    content: { type: "text", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createTable("chunks", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    document_id: {
      type: "uuid",
      notNull: true,
      references: "documents",
      onDelete: "cascade",
    },
    content: { type: "text", notNull: true },
    position: { type: "integer", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createIndex("chunks", "document_id");
};

exports.down = (pgm) => {
  pgm.dropTable("chunks");
  pgm.dropTable("documents");
};
