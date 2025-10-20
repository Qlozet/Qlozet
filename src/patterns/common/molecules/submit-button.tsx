import { FC, useEffect } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { If } from "@/patterns/common/atoms/If";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the SubmitButton component
 */
interface ISubmitButtonprops extends ButtonProps {
  /** Whether the button is in a loading state */
  loading?: boolean;
}

/**
 * A submit button component that displays a loading spinner when in loading state
 *
 * This component extends the base Button component with loading functionality.
 * When loading is true, it shows a spinning loader and hides the button text.
 * It also manages a global loading indicator in localStorage.
 *
 * @param props - Component props
 * @param props.loading - Whether the button is in loading state (default: false)
 * @param props.children - Button content to display when not loading
 * @param props...rest - All other ButtonProps are passed through to the underlying Button
 *
 * @example
 * ```tsx
 * <SubmitButton loading={isSubmitting}>
 *   Submit Form
 * </SubmitButton>
 * ```
 */
const SubmitButton: FC<ISubmitButtonprops> = ({
  loading = false,
  children,
  ...props
}) => {
  // useEffect(() => {
  //   if (loading) {
  //     localStorage.setItem('globalLoadingIndicator', 'true');
  //   } else {
  //     localStorage.removeItem('globalLoadingIndicator');
  //   }
  // }, [loading]);

  return (
    <Button className={cn('w-full', props.className)} {...props} type='submit'>
      <If isTrue={loading}>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      </If>
      {children}
    </Button>
  );
};

export { SubmitButton };
