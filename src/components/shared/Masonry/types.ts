import {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
} from 'react'

export type BreakPoints = Record<number, number> | Array<number | undefined>
export type BreakPointsArray = Array<number | undefined>

export type BreakPointSpec = BreakPoints | BreakPointsArray
export type Columns = number | BreakPointSpec

type AsProp<T extends ElementType> = {
  asElement?: T
}

type PropsToOmit<T extends ElementType, P> = keyof (AsProp<T> & P)

type PolymorphicComponentProp<
  T extends ElementType,
  Props = NonNullable<unknown>,
> = PropsWithChildren<Props & AsProp<T>> &
  Omit<ComponentPropsWithoutRef<T>, PropsToOmit<T, Props>>

type PolymorphicComponentPropWithRef<
  T extends ElementType,
  Props = NonNullable<unknown>,
> = PolymorphicComponentProp<T, Props> & {
  ref?: PolymorphicRef<T>
}

export type PolymorphicRef<T extends ElementType> =
  ComponentPropsWithRef<T>['ref']

type MasonryOwnProps<T extends ElementType> = {
  columns?: Columns
  gap?: number
  columnProps?: PolymorphicComponentPropWithRef<T, NonNullable<unknown>>
}
export type MasonryProps<T extends ElementType> =
  PolymorphicComponentPropWithRef<T, MasonryOwnProps<T>>
