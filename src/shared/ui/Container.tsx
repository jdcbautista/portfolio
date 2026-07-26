import { createElement } from 'react'
import { cn } from '@/shared/lib/cn'

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType
}

/** Centered, responsive max-width wrapper used across every page. */
export function Container({
  as: Tag = 'div',
  className,
  ...props
}: ContainerProps) {
  // createElement avoids the polymorphic-`as` JSX inference that resolves the
  // tag's props to `never` under TS 6.
  return createElement(Tag, {
    className: cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className),
    ...props,
  })
}
