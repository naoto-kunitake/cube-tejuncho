import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import packageJsonText from '../../package.json?raw';
import { APP_VERSION } from './app-version';

const PackageJsonSchema = z.object({ version: z.string() });

describe('APP_VERSION', () => {
  it('package.json の version と同じ値が入っている', () => {
    const packageJson = PackageJsonSchema.parse(JSON.parse(packageJsonText));
    expect(APP_VERSION).toBe(packageJson.version);
  });
});
