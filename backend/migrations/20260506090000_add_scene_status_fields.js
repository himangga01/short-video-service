/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasImageStatus = await knex.schema.hasColumn('panels', 'image_status');
  const hasTtsStatus = await knex.schema.hasColumn('panels', 'tts_status');
  const hasRenderReady = await knex.schema.hasColumn('panels', 'render_ready');

  await knex.schema.alterTable('panels', (table) => {
    if (!hasImageStatus) {
      table.string('image_status', 50).notNullable().defaultTo('empty');
      table.text('image_error');
      table.integer('image_width');
      table.integer('image_height');
      table.integer('image_file_size');
    }

    if (!hasTtsStatus) {
      table.string('tts_status', 50).notNullable().defaultTo('idle');
      table.string('tts_model', 100);
      table.string('tts_hash', 128);
      table.text('tts_instructions');
      table.text('tts_error');
      table.integer('audio_duration_ms');
      table.integer('audio_file_size');
    }

    if (!hasRenderReady) {
      table.boolean('render_ready').notNullable().defaultTo(false);
      table.string('subtitle_position', 20).notNullable().defaultTo('bottom');
      table.string('transition_type', 20).notNullable().defaultTo('none');
      table.integer('transition_duration_ms').notNullable().defaultTo(0);
    }
  });

  const hasRenderJobs = await knex.schema.hasTable('render_jobs');

  if (!hasRenderJobs) {
    await knex.schema.createTable('render_jobs', (table) => {
      table.uuid('id').primary();
      table.uuid('project_id').notNullable();
      table.string('status', 50).notNullable().defaultTo('pending');
      table.integer('progress').notNullable().defaultTo(0);
      table.string('output_url');
      table.text('error_message');
      table.timestamps(true, true);

      table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
      table.index('project_id');
      table.index('status');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasRenderJobs = await knex.schema.hasTable('render_jobs');
  if (hasRenderJobs) {
    await knex.schema.dropTable('render_jobs');
  }

  const hasImageStatus = await knex.schema.hasColumn('panels', 'image_status');
  const hasTtsStatus = await knex.schema.hasColumn('panels', 'tts_status');
  const hasRenderReady = await knex.schema.hasColumn('panels', 'render_ready');

  await knex.schema.alterTable('panels', (table) => {
    if (hasRenderReady) {
      table.dropColumns(
        'render_ready',
        'subtitle_position',
        'transition_type',
        'transition_duration_ms'
      );
    }

    if (hasTtsStatus) {
      table.dropColumns(
        'tts_status',
        'tts_model',
        'tts_hash',
        'tts_instructions',
        'tts_error',
        'audio_duration_ms',
        'audio_file_size'
      );
    }

    if (hasImageStatus) {
      table.dropColumns(
        'image_status',
        'image_error',
        'image_width',
        'image_height',
        'image_file_size'
      );
    }
  });
};
