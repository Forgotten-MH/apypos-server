import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs');
vi.mock('crc/crcjam', () => ({ default: vi.fn() }));
vi.mock('../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

import * as fs from 'fs';
import crcjam from 'crc/crcjam';
import { makeDownloadList } from './initResourceDownloadList.js';

describe('initResourceDownloadList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('skips generation when download.list already exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    makeDownloadList('stdDL', 'android');

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.readdirSync).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('generates download.list from FPK files', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    // Simulate directory structure: one directory with one FPK file
    vi.mocked(fs.readdirSync).mockImplementation((dir: fs.PathLike) => {
      const dirStr = String(dir);
      if (dirStr.endsWith('stdDL')) {
        return ['v0282'] as unknown as fs.Dirent[];
      }
      if (dirStr.endsWith('v0282')) {
        return ['sound.01.fpk'] as unknown as fs.Dirent[];
      }
      return [] as unknown as fs.Dirent[];
    });
    vi.mocked(fs.statSync).mockImplementation((filePath: fs.PathLike) => {
      const pathStr = String(filePath);
      if (pathStr.endsWith('.fpk')) {
        return { isDirectory: () => false, size: 1024 } as fs.Stats;
      }
      return { isDirectory: () => true, size: 0 } as fs.Stats;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from('fake-fpk-data'));
    vi.mocked(crcjam).mockReturnValue(12345);
    vi.mocked(fs.writeFile).mockImplementation(
      (...args: unknown[]) => {
        const cb = args[args.length - 1] as (err: NodeJS.ErrnoException | null) => void;
        cb(null);
      },
    );

    makeDownloadList('stdDL', 'android');

    expect(fs.readFileSync).toHaveBeenCalled();
    expect(crcjam).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('download.list'),
      expect.any(String),
      expect.any(Function),
    );
  });

  it('strips v0282 from file paths in output', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readdirSync).mockImplementation((dir: fs.PathLike) => {
      const dirStr = String(dir);
      if (dirStr.endsWith('stdDL')) {
        return ['v0282'] as unknown as fs.Dirent[];
      }
      if (dirStr.endsWith('v0282')) {
        return ['test.fpk'] as unknown as fs.Dirent[];
      }
      return [] as unknown as fs.Dirent[];
    });
    vi.mocked(fs.statSync).mockImplementation((filePath: fs.PathLike) => {
      const pathStr = String(filePath);
      if (pathStr.endsWith('.fpk')) {
        return { isDirectory: () => false, size: 512 } as fs.Stats;
      }
      return { isDirectory: () => true, size: 0 } as fs.Stats;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from('data'));
    vi.mocked(crcjam).mockReturnValue(99999);

    let writtenContent = '';
    vi.mocked(fs.writeFile).mockImplementation(
      (...args: unknown[]) => {
        writtenContent = args[1] as string;
        const cb = args[args.length - 1] as (err: NodeJS.ErrnoException | null) => void;
        cb(null);
      },
    );

    makeDownloadList('stdDL', 'android');

    expect(writtenContent).not.toContain('v0282');
  });

  it('skips non-FPK files', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readdirSync).mockReturnValue(
      ['readme.txt', 'data.json'] as unknown as fs.Dirent[],
    );
    vi.mocked(fs.statSync).mockReturnValue({
      isDirectory: () => false,
      size: 100,
    } as fs.Stats);

    let writtenContent = '';
    vi.mocked(fs.writeFile).mockImplementation(
      (...args: unknown[]) => {
        writtenContent = args[1] as string;
        const cb = args[args.length - 1] as (err: NodeJS.ErrnoException | null) => void;
        cb(null);
      },
    );

    makeDownloadList('stdDL', 'android');

    // No FPK files means empty content written
    expect(writtenContent).toBe('');
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  it('handles writeFile error without throwing', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readdirSync).mockReturnValue([] as unknown as fs.Dirent[]);

    vi.mocked(fs.writeFile).mockImplementation(
      (...args: unknown[]) => {
        const cb = args[args.length - 1] as (err: NodeJS.ErrnoException | null) => void;
        cb(new Error('disk full') as NodeJS.ErrnoException);
      },
    );

    expect(() => makeDownloadList('stdDL', 'android')).not.toThrow();
  });
});
