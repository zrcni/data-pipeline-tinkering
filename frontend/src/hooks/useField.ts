import React from "react"

type Config = {
  formatValue?: (value: string) => string
  defaultValue?: string | number | null
}

function getDefaultValue(type: string, config: Config) {
  if (type === "number") {
    return config.defaultValue || 0
  }
  return config.defaultValue || ""
}

export function useField(type: string, config: Config = {}) {
  const [value, setValue] = React.useState(getDefaultValue(type, config))

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    let value = event.target.value
    if (config.formatValue) {
      value = config.formatValue(event.target.value)
    }
    setValue(value)
  }

  function clear() {
    setValue("")
  }

  return {
    inputProps: {
      type,
      value,
      onChange
    },
    value,
    clear
  }
}
