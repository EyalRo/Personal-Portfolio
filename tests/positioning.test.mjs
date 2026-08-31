import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('homepage presents trusted AI and enterprise platform focus', async () => {
  const homepage = await read('../src/pages/index.astro');

  assert.match(homepage, /AI\/LLM integrations/i);
  assert.match(homepage, /governable/i);
  assert.match(homepage, /How I build trusted systems/i);
});

test('work and metadata describe AI as an enterprise-product focus', async () => {
  const [workIndex, head] = await Promise.all([
    read('../src/pages/work/index.astro'),
    read('../src/components/Head.astro'),
  ]);

  assert.match(workIndex, /enterprise integration/i);
  assert.match(head, /AI\/LLM integrations/i);
  assert.match(head, /Enterprise Platforms/i);
});
