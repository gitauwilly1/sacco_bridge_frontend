const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SITE_KEY) {
  console.warn('VITE_RECAPTCHA_SITE_KEY is not defined. reCAPTCHA will be unavailable.');
}

const loadRecaptchaScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('reCAPTCHA can only be loaded in the browser'));}

    if (window.grecaptcha) {
      return resolve(window.grecaptcha);
    }

    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.grecaptcha));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA script')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) {
        resolve(window.grecaptcha);
      } else {
        reject(new Error('reCAPTCHA script loaded but grecaptcha is unavailable'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.head.appendChild(script);
  });

export async function getRecaptchaToken(action = 'submit') {
  if (!RECAPTCHA_SITE_KEY) {
    return null;
  }

  try {
    const grecaptcha = window.grecaptcha || (await loadRecaptchaScript());
    await new Promise((resolve) => grecaptcha.ready(resolve));
    return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
  } catch {
    return null;
  }
}
