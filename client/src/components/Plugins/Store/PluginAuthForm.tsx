import { TPlugin, TPluginAuthConfig } from '~/data-provider';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { TPluginAction } from './PluginStoreDialog';

type TPluginAuthFormProps = {
  plugin: TPlugin;
  onSubmit: (installActionData: TPluginAction) => void;
};

function PluginAuthForm({ plugin, onSubmit }: TPluginAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid, isSubmitting }
  } = useForm();

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="grid w-full gap-6 sm:grid-cols-2">
        <form
          className="col-span-1 flex w-full flex-col items-start justify-start gap-2"
          method="POST"
          onSubmit={handleSubmit((auth) =>
            onSubmit({ pluginKey: plugin.pluginKey, action: 'install', auth })
          )}
        >
          {plugin.authConfig?.map((config: TPluginAuthConfig, i: number) => (
            <div key={`${config.authField}-${i}`} className="flex w-full flex-col gap-1">
              <label
                htmlFor={config.authField}
                className="mb-1 text-left text-sm font-medium text-slate-700/70 dark:text-slate-50/70"
              >
                {config.label}
              </label>
              <input
                type="text"
                id={config.authField}
                aria-invalid={!!errors[config.authField]}
                aria-describedby={`${config.authField}-error`}
                aria-label={config.label}
                aria-required="true"
                {...register(config.authField, {
                  required: `${config.label} is required.`,
                  minLength: {
                    value: 10,
                    message: `${config.label} must be at least 10 characters long`
                  }
                })}
                className="flex h-10 max-h-10 w-full resize-none rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400 focus:border-slate-400 focus:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-gray-400 focus:ring-opacity-0 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-50 dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] dark:focus:border-gray-400 focus:dark:bg-gray-600 dark:focus:outline-none dark:focus:ring-0 dark:focus:ring-gray-400 dark:focus:ring-offset-0"
              />
              {errors[config.authField] && (
                <span role="alert" className="mt-1 text-sm text-red-400">
                  {/* @ts-ignore - Type 'string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined' is not assignable to type 'ReactNode' */}
                  {errors[config.authField].message}
                </span>
              )}
            </div>
          ))}
          <button
            disabled={!isDirty || !isValid || isSubmitting}
            type="submit"
            className="btn btn-primary relative"
          >
            <div className="flex items-center justify-center gap-2">
              Save
              <Save className="flex w-4 h-4 items-center stroke-2" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

export default PluginAuthForm;
