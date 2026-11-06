import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The form talks to the API through this module. It is replaced by a fake server, so no network is involved.
// The fake is a plain function (not vi.fn): Vitest's own call tracking keeps a copy of every promise a mock
// returns, and for a promise that REJECTS that copy is reported as an unhandled error, blaming the test.
const server = vi.hoisted(() => ({ calls: [], respond: () => Promise.resolve({}) }));
vi.mock('../../lib/axios.js', () => ({
  default: {
    post: (...args) => {
      server.calls.push(args);
      return server.respond(...args);
    },
  },
}));
const { default: ContactForm } = await import('./ContactForm.jsx');

const succeed = (message) => {
  server.respond = () => Promise.resolve({ data: { data: { message } } });
};
// What Axios throws when the server answers with an error: a real Error that carries the response
const fail = (status, error) => {
  server.respond = () => Promise.reject(Object.assign(new Error(`Request failed with status code ${status}`), { response: { status, data: { error } } }));
};

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ContactForm />
    </QueryClientProvider>
  );
}

async function fillValid(user) {
  await user.type(screen.getByLabelText(/^Name/), 'Jane Visitor');
  await user.type(screen.getByLabelText(/^Email/), 'jane@example.com');
  await user.type(screen.getByLabelText(/^Subject/), 'A question');
  await user.type(screen.getByLabelText(/^Message/), 'I would like to know more about your services.');
}

beforeEach(() => {
  server.calls.length = 0;
  server.respond = () => Promise.resolve({});
});

describe('contact form', () => {
  it('shows an error next to every required field when sent empty, and sends nothing', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    const messages = (await screen.findAllByRole('alert')).map((alert) => alert.textContent);
    expect(messages).toEqual(expect.arrayContaining(['Please enter your name', 'Please enter your email', 'Please add a short subject']));
    expect(messages.some((text) => text.startsWith('Please write at least 10 characters'))).toBe(true);
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('aria-invalid', 'true');
    expect(server.calls).toHaveLength(0);
  });

  it('sends a valid message, leaving out the optional boxes that are empty, and then confirms', async () => {
    succeed('Thank you! Your message has been sent.');
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await screen.findByText('Thank you! Your message has been sent.');
    expect(server.calls).toHaveLength(1);
    const [path, body] = server.calls[0];
    expect(path).toBe('/inquiries');
    expect(body).toMatchObject({ name: 'Jane Visitor', email: 'jane@example.com', subject: 'A question' });
    expect(body.phone).toBeUndefined();
    expect(body.company).toBeUndefined();
    expect(body.website).toBeUndefined(); // the hidden honeypot stayed empty
  });

  it('cannot be sent twice by clicking quickly', async () => {
    let finish;
    server.respond = () => new Promise((resolve) => { finish = resolve; });
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.dblClick(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(server.calls).toHaveLength(1));
    finish({ data: { data: { message: 'Thank you!' } } });
    await screen.findByText('Thank you!');
    expect(server.calls).toHaveLength(1);
  });

  it('shows a field problem the server found next to that field', async () => {
    fail(400, { message: 'Validation failed', code: 'VALIDATION_ERROR', details: [{ field: 'email', message: 'That address looks wrong' }] });
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('That address looks wrong')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('explains a rate limit in an announced message, and keeps what the visitor typed', async () => {
    fail(429, { message: 'Too many messages sent. Please try again later.', code: 'RATE_LIMITED' });
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    const alert = await screen.findByText('Too many messages sent. Please try again later.');
    expect(alert.closest('[role="alert"]')).not.toBeNull();
    expect(screen.getByLabelText(/^Message/)).toHaveValue('I would like to know more about your services.');
  });

  it('explains a network failure in plain words', async () => {
    server.respond = () => Promise.reject(new Error('Network Error'));
    const user = userEvent.setup();
    renderForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText(/could not reach the server/i)).toBeInTheDocument();
  });

  it('hides the spam-trap field from people and screen readers', () => {
    renderForm();
    const trap = screen.getByLabelText('Leave this field empty', { selector: 'input', exact: false });
    expect(trap).toHaveAttribute('tabindex', '-1');
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
