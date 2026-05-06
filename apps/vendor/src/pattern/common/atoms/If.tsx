
import { ReactNode } from 'react';

type Props = {
    isTrue: boolean;
    children: ReactNode;
};

/**
 * The If component can be used for simple conditional rendering.
 * It will render its children whenever the condition passed to the isTrue prop is truthy.
 * For more complex rendering logic, you can use the Show component.
 *
 * @param isTrue - Boolean condition that determines whether children should be rendered
 * @param children - React nodes to render when isTrue is truthy
 * @returns The children if isTrue is truthy, null otherwise
 */
export const If = ({ isTrue, children }: Props) => (isTrue ? children : null);