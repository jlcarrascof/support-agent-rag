/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

// nomic-embed-text produces 768-dimensional embeddings.
const EMBEDDING_DIMENSIONS = 768;

exports.up = (pgm) => {
  pgm.createExtension("vector", { ifNotExists: true });

  pgm.addColumn("chunks", {
    embedding: { type: `vector(${EMBEDDING_DIMENSIONS})` },
  });

  pgm.createIndex("chunks", [{ name: "embedding", opclass: "vector_cosine_ops" }], {
    name: "chunks_embedding_hnsw_idx",
    method: "hnsw",
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("chunks", [{ name: "embedding", opclass: "vector_cosine_ops" }], {
    name: "chunks_embedding_hnsw_idx",
  });
  pgm.dropColumn("chunks", "embedding");
};
