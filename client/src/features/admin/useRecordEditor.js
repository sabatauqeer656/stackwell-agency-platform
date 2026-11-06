import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUnsavedGuard } from './useUnsavedGuard.js';
import { useAuth } from '../auth/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getApiError } from '../../lib/apiErrors.js';

/**
 * Everything an "add / edit one record" form needs, so each editor only describes its fields.
 * `item` is the saved record (editing) or undefined (creating). `config` is a constant object:
 *   noun, Noun            - for messages, e.g. 'team member' / 'Team member'
 *   adminPath             - the list address, e.g. '/admin/team' (a created record opens at `${adminPath}/${id}`)
 *   schema, empty         - the Zod rules and the starting values of an empty form
 *   toFormValues(item)    - saved record -> form values;  toPayload(values, { isEdit }) - form values -> API body
 *   serverFields          - fields the server may complain about; shown next to the field (anything else is a toast)
 *   hooks                 - { useCreate, useUpdate, useDelete } from the content API
 *   createdMessage        - optional wording for the "created" toast
 */
export function useRecordEditor({ item, config }) {
  const { Noun, adminPath, schema, empty, toFormValues, toPayload, serverFields, hooks } = config;
  const isEdit = Boolean(item);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const create = hooks.useCreate();
  const update = hooks.useUpdate();
  const remove = hooks.useDelete();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: item ? toFormValues(item) : empty,
    mode: 'onTouched', // an error appears when you leave a field, and goes away as soon as it is fixed
  });
  const { errors, isDirty, isSubmitting } = form.formState;
  const { blocker, allowLeave } = useUnsavedGuard(isDirty);

  const submit = form.handleSubmit(async (values) => {
    const payload = toPayload(values, { isEdit });
    try {
      if (isEdit) {
        const saved = await update.mutateAsync({ id: item._id, changes: payload });
        form.reset(toFormValues(saved)); // the form now matches what is stored, so it is "clean" again
        toast.success(`${Noun} saved`);
      } else {
        const saved = await create.mutateAsync(payload);
        toast.success(config.createdMessage ?? `${Noun} created`);
        allowLeave.current = true;
        navigate(`${adminPath}/${saved._id}`, { replace: true });
      }
    } catch (error) {
      const { message, details } = getApiError(error);
      const fieldErrors = details.filter((detail) => serverFields.includes(detail.field));
      fieldErrors.forEach((detail) => form.setError(detail.field, { type: 'server', message: detail.message }));
      if (fieldErrors.length > 0) form.setFocus(fieldErrors[0].field);
      else toast.error(message);
    }
  });

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(item._id);
      toast.success(`${Noun} deleted`);
      allowLeave.current = true;
      navigate(adminPath, { replace: true });
    } catch (error) {
      setConfirmingDelete(false);
      toast.error(getApiError(error).message); // e.g. a reason the server refused
    }
  };

  return {
    form,
    errors,
    isEdit,
    isDirty,
    isSubmitting,
    submit,
    // Only administrators may delete (the API enforces it too). Editors never see the Delete card.
    canDelete: isEdit && user.role === 'admin',
    confirmingDelete,
    setConfirmingDelete,
    confirmDelete,
    deleting: remove.isPending,
    blocker,
  };
}
