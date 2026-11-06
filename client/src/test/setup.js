import '@testing-library/jest-dom/vitest'; // adds readable checks such as expect(button).toBeDisabled()
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Remove everything a test rendered, so tests cannot affect each other
afterEach(cleanup);

// jsdom does not implement the native <dialog> methods that our Modal relies on.
// This minimal version opens and closes the dialog and fires "close" the way a browser does.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
