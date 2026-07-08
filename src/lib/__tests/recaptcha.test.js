import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockDocument = {
  head: { innerHTML: '' },
  body: { innerHTML: '', appendChild: vi.fn() },
  createElement: vi.fn(() => ({ style: {}, appendChild: vi.fn() })),
  querySelector: vi.fn(() => null),
};

describe('getRecaptchaToken', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_RECAPTCHA_SITE_KEY', 'site-key');
    global.document = mockDocument;
    global.window = { grecaptcha: undefined, document: mockDocument };
    delete window.grecaptcha;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders an invisible widget and returns a token from it', async () => {
    const ready = vi.fn((callback) => callback());
    const execute = vi.fn().mockResolvedValue('captcha-token');
    const render = vi.fn().mockReturnValue('widget-1');

    window.grecaptcha = { ready, render, execute };

    const { getRecaptchaToken } = await import('../recaptcha');
    const token = await getRecaptchaToken('login');

    expect(render).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      sitekey: 'site-key',
      size: 'invisible',
    }));
    expect(execute).toHaveBeenCalledWith('widget-1', { action: 'login' });
    expect(token).toBe('captcha-token');
  });
});
