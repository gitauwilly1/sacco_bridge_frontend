const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SITE_KEY) {
  console.warn('VITE_RECAPTCHA_SITE_KEY is not defined. reCAPTCHA will be unavailable.');
}

const loadRecaptchaScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('reCAPTCHA can only be loaded in the browser'));
    }

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
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
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

let widgetId = null;
let widgetContainer = null;

const ensureWidget = async () => {
  if (!RECAPTCHA_SITE_KEY) {
    throw new Error('reCAPTCHA site key is not configured');
  }

  const grecaptcha = window.grecaptcha || (await loadRecaptchaScript());

  await new Promise((resolve, reject) => {
    try {
      grecaptcha.ready(() => resolve());
    } catch (error) {
      reject(error);
    }
  });

  if (!widgetContainer) {
    widgetContainer = document.createElement('div');
    widgetContainer.style.position = 'absolute';
    widgetContainer.style.left = '-9999px';
    widgetContainer.style.top = '-9999px';
    document.body.appendChild(widgetContainer);
  }

  if (widgetId === null) {
    widgetId = grecaptcha.render(widgetContainer, {
      sitekey: RECAPTCHA_SITE_KEY,
      size: 'invisible',
      badge: 'bottomright',
    });
  }

  return { grecaptcha, widgetId };
};

export async function getRecaptchaToken(action = 'submit') {
  const { grecaptcha, widgetId: activeWidgetId } = await ensureWidget();

  try {
    return await grecaptcha.execute(activeWidgetId, { action });
  } catch (error) {
    throw new Error(`reCAPTCHA execution failed: ${error.message || error}`);
  }
}
