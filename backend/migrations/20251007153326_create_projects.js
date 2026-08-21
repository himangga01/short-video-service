/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('projects', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('channel_name', 100);
    table.integer('view_count').defaultTo(0);
    table.boolean('show_author').defaultTo(true);
    table.string('status', 50).defaultTo('draft'); // draft, in_progress, completed
    table.timestamps(true, true);
    
    table.index('status');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};
