import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button.jsx';
import Checkbox from './Checkbox.jsx';
import EmptyState from './EmptyState.jsx';
import FilterChips from './FilterChips.jsx';
import Input from './Input.jsx';
import Pagination from './Pagination.jsx';
import Select from './Select.jsx';
import StarRating from './StarRating.jsx';
import Textarea from './Textarea.jsx';
import ConfirmDialog from '../admin/ConfirmDialog.jsx';

describe('form fields are properly labelled for screen readers', () => {
  it('Input: the label points at the box, a required star is hidden from screen readers', () => {
    render(<Input label="Email" required />);
    const input = screen.getByLabelText(/^Email/);
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('Input: an error is announced, marks the box invalid and is linked to it', () => {
    render(<Input label="Email" error="Enter a valid email" hint="We never share it" />);
    const input = screen.getByLabelText('Email');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Enter a valid email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email'); // the error replaces the hint
  });

  it('Input: without an error, the hint describes the box', () => {
    render(<Input label="Phone" hint="Optional" />);
    expect(screen.getByLabelText('Phone')).toHaveAccessibleDescription('Optional');
    expect(screen.getByLabelText('Phone')).not.toHaveAttribute('aria-invalid');
  });

  it('Textarea, Select and Checkbox are labelled too', async () => {
    render(
      <>
        <Textarea label="Message" error="Too short" />
        <Select label="Status">
          <option value="a">A</option>
          <option value="b">B</option>
        </Select>
        <Checkbox label="Published" hint="Visible to visitors" />
      </>
    );
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-invalid', 'true');
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'b');
    expect(screen.getByLabelText('Status')).toHaveValue('b');
    const box = screen.getByLabelText('Published');
    expect(box).toHaveAccessibleDescription('Visible to visitors');
    await userEvent.click(box);
    expect(box).toBeChecked();
  });
});

describe('Button', () => {
  it('is a plain button that never submits a form by accident', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('while loading it is disabled and announces that it is busy', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('as a link, a disabled one says so with aria-disabled', () => {
    render(
      <Button as="a" href="/x" disabled>
        Go
      </Button>
    );
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('FilterChips', () => {
  const options = [{ value: '', label: 'All' }, { value: 'new', label: 'New' }];

  it('shows which chip is selected to screen readers, and reports a choice', async () => {
    const onChange = vi.fn();
    render(<FilterChips label="Filter by status" options={options} value="" onChange={onChange} />);
    expect(screen.getByRole('group', { name: 'Filter by status' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'New' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'New' }));
    expect(onChange).toHaveBeenCalledWith('new');
  });
});

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('marks the current page, shows the first and last page with a gap, and moves with Next and Previous', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={5} totalPages={20} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 10' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it('cannot go before the first or after the last page', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
});

describe('EmptyState and StarRating', () => {
  it('EmptyState uses a heading that follows the page title, and shows its action', () => {
    render(<EmptyState title="No services yet" description="Add the first one." action={<button type="button">New service</button>} />);
    expect(screen.getByRole('heading', { level: 2, name: 'No services yet' })).toBeInTheDocument();
    expect(screen.getByText('Add the first one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New service' })).toBeInTheDocument();
  });

  it('StarRating is one image with a text label, not five separate icons', () => {
    render(<StarRating rating={4} />);
    expect(screen.getByRole('img', { name: '4 out of 5 stars' })).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('opens as a dialog with its title, and confirm and cancel report back', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog open title="Delete this service?" message="It will be removed." onConfirm={onConfirm} onCancel={onCancel} />);
    const dialog = screen.getByRole('dialog', { name: 'Delete this service?' });
    expect(dialog).toHaveTextContent('It will be removed.');
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('cannot be confirmed or cancelled again while the deletion is running', () => {
    render(<ConfirmDialog open title="Delete?" message="Sure?" loading onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('is not shown while closed', () => {
    render(<ConfirmDialog open={false} title="Delete?" message="Sure?" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
