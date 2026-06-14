import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5173';
const CHROME_PORT = Number(process.env.CHROME_PORT || 9222);
const chromePath = process.env.CHROME_PATH
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const verbose = process.env.UI_E2E_VERBOSE === 'true';
const log = (message) => {
  if (verbose) process.stdout.write(`${message}\n`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const requestJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed ${response.status}: ${url}`);
  return response.json();
};

const waitFor = async (fn, timeout = 15000, interval = 250) => {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeout) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await delay(interval);
  }

  throw lastError || new Error('Timed out waiting for condition');
};

const connectToChrome = async () => {
  const targets = await waitFor(
    async () => {
      const pages = await requestJson(`http://127.0.0.1:${CHROME_PORT}/json`);
      return pages.find(page => page.type === 'page' && page.webSocketDebuggerUrl);
    },
    10000
  );

  const ws = new WebSocket(targets.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.once = (event, handler) => {
      const listener = (payload) => {
        ws.removeEventListener(event, listener);
        handler(payload);
      };
      ws.addEventListener(event, listener);
    };
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  let id = 0;
  const pending = new Map();
  const events = [];
  const consoleErrors = [];

  ws.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }

    events.push(message);
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      consoleErrors.push(
        details?.exception?.description
          || details?.exception?.value
          || details?.text
          || 'Runtime exception'
      );
    }
    if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      consoleErrors.push(message.params.entry.text);
    }
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const messageId = ++id;
    pending.set(messageId, { resolve, reject });
    ws.send(JSON.stringify({ id: messageId, method, params }));
  });

  return { ws, send, events, consoleErrors };
};

const evaluate = async (send, expression) => {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Evaluation failed');
  }

  return result.result?.value;
};

const waitForText = async (send, text, timeout, consoleErrors = []) => {
  try {
    return await waitFor(
      () => evaluate(send, `document.body.innerText.includes(${JSON.stringify(text)})`),
      timeout
    );
  } catch (error) {
    const snapshot = await evaluate(send, `JSON.stringify({
      href: location.href,
      readyState: document.readyState,
      title: document.title,
      body: document.body?.innerText?.slice(0, 500) || '',
      html: document.documentElement?.outerHTML?.slice(0, 1000) || ''
    })`).catch(() => null);
    const browserErrors = consoleErrors.length ? ` Browser errors: ${consoleErrors.join(' | ')}` : '';
    throw new Error(`Timed out waiting for text "${text}". Snapshot: ${snapshot || 'unavailable'}${browserErrors}`);
  }
};

const waitForUrl = (send, text, timeout) => waitFor(
  () => evaluate(send, `location.href.includes(${JSON.stringify(text)})`),
  timeout
);

const fillForm = (values) => `
(() => {
  const setNativeValue = (element, value) => {
    const prototype = element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const values = ${JSON.stringify(values)};
  for (const [name, value] of Object.entries(values)) {
    const element = document.querySelector('[name="' + name + '"]');
    if (!element) throw new Error('Missing form field: ' + name);
    setNativeValue(element, value);
  }
  document.querySelector('form').requestSubmit();
})()
`;

const clickByText = (text) => `
(() => {
  const candidates = [...document.querySelectorAll('button,a')];
  const target = candidates.find(element => element.innerText.trim().includes(${JSON.stringify(text)}));
  if (!target) throw new Error('Missing clickable text: ${text}');
  target.click();
})()
`;

const run = async () => {
  log(`UI e2e starting for ${APP_URL}`);
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome not found at ${chromePath}. Set CHROME_PATH to override.`);
  }

  const tmpRoot = fs.existsSync('C:\\tmp') ? 'C:\\tmp' : os.tmpdir();
  const userDataDir = path.join(tmpRoot, `resumind-chrome-${Date.now()}`);
  const chrome = spawn(chromePath, [
    `--user-data-dir=${userDataDir.replaceAll('\\', '/')}`,
    '--headless=new',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-crash-reporter',
    '--disable-breakpad',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu-sandbox',
    '--no-sandbox',
    `--remote-debugging-port=${CHROME_PORT}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let chromeStderr = '';
  chrome.stderr.on('data', (chunk) => {
    chromeStderr += chunk.toString();
  });

  let client;
  try {
    client = await connectToChrome();
  } catch (error) {
    chrome.kill();
    throw new Error(`${error.message}\nChrome stderr:\n${chromeStderr}`);
  }
  const { send, ws, consoleErrors } = client;

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('DOM.enable');

    const email = `ui_${Date.now()}@example.com`;
    const password = 'Password@123';

    await send('Page.navigate', { url: `${APP_URL}/register` });
    await waitForText(send, 'Create a new account', undefined, consoleErrors);
    await evaluate(send, fillForm({ name: 'UI Test User', email, password }));
    await waitForUrl(send, '/login');

    await waitForText(send, 'Sign in to your account', undefined, consoleErrors);
    await evaluate(send, fillForm({ email, password }));
    await waitForUrl(send, '/dashboard');
    await waitForText(send, 'Welcome back', undefined, consoleErrors);

    await send('Page.navigate', { url: `${APP_URL}/dashboard/upload` });
    await waitForText(send, 'Upload Your Resume', undefined, consoleErrors);

    const documentNode = await send('DOM.getDocument');
    const inputNode = await send('DOM.querySelector', {
      nodeId: documentNode.root.nodeId,
      selector: 'input[type="file"]',
    });
    const resumePath = path.resolve('../backend/samples/resume.docx');
    await send('DOM.setFileInputFiles', {
      nodeId: inputNode.nodeId,
      files: [resumePath],
    });
    await waitForText(send, 'resume.docx', undefined, consoleErrors);
    await evaluate(send, clickByText('Analyze Resume'));
    await waitForUrl(send, '/dashboard/analysis/');

    await waitForText(send, 'Target Role', undefined, consoleErrors);
    await evaluate(send, fillForm({
      jobTitle: 'Software Engineer',
      jobDescriptionText: 'We need a Software Engineer with Node.js, Express, MongoDB, REST API, authentication, cloud storage, and resume parsing experience.',
    }));
    await waitForText(send, 'ATS Analysis Results', 20000, consoleErrors);

    await evaluate(send, clickByText('Fix with AI Rewrite'));
    await waitForText(send, 'Fix Your Resume with AI', undefined, consoleErrors);
    await evaluate(send, clickByText('Rewrite Full Resume'));
    await waitForText(send, 'Rewrite Complete!', 30000, consoleErrors);
    await waitForText(send, 'Export PDF', undefined, consoleErrors);
    await waitForText(send, 'Export DOCX', undefined, consoleErrors);

    await evaluate(send, clickByText('Logout'));
    await waitForUrl(send, '/login');

    if (consoleErrors.length) {
      throw new Error(`Browser console/runtime errors: ${consoleErrors.join(' | ')}`);
    }

    process.stdout.write(`UI e2e passed for ${APP_URL}\n`);
  } finally {
    ws.close();
    chrome.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // Chrome can keep profile files locked briefly after shutdown on Windows.
    }
  }
};

run().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
