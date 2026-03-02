import { describe, it, expect } from 'vitest';
import { StoryEndSchema } from './story.schema.js';

describe('story.schema', () => {
  it('validates correct input', () => {
    expect(
      StoryEndSchema.safeParse({
        session_id: 'sid',
        mst_node_id: 1,
        mst_note_content_id: 1,
        mst_ocean_id: 1,
        mst_part_id: 1,
        mst_story_id: 1,
      }).success,
    ).toBe(true);
  });
});
