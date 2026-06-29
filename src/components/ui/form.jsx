import * as React from "react"
import { Controller, FormProvider, useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

const FormField = ({ control, name, render }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) =>
        render({ field, fieldState })
      }
    />
  )
}

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  return <Label ref={ref} className={cn(className)} {...props} />
})
FormLabel.displayName = "FormLabel"

const FormControl = ({ children, ...props }) => {
  return React.cloneElement(children, props)
}
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { formState } = useFormContext() || {}
  const fieldName = props.name

  const error = fieldName
    ? formState?.errors?.[fieldName]
    : null

  const body = error ? String(error?.message) : children

  if (!body) return null

  return (
    <p ref={ref} className={cn("text-sm font-medium text-danger", className)} {...props}>
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormContext }