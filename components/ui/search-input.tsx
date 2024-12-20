import * as React from "react"
import { Search } from "lucide-react"

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
}

export function SearchInput({
  onSearch,
  className,
  ...props
}: SearchInputProps) {
  const [value, setValue] = React.useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch?.(newValue)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <input
        type="search"
        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
} 