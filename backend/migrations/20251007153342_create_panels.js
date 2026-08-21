/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('panels', table => {
    table.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    table.uuid('project_id').notNullable();
    table.integer('order_index').notNullable();
    table.text('script').notNullable();
    table.string('image_url');
    table.string('audio_url');
    table.string('voice_id').defaultTo('Kore'); // Gemini TTS prebuilt voice name
    table.float('voice_speed').defaultTo(1.0);
    table.integer('text_size').defaultTo(22);
    table.string('text_color', 7).defaultTo('#FFFFFF');
    table.string('background_color', 7).defaultTo('#000000');
    table.timestamps(true, true);
    
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.index('project_id');
    table.index(['project_id', 'order_index']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('panels');
};
