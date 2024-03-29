// Given an Array or Object,
// return LAMOS.
export function unsorted (data) {
  return recurse(data, 0)
}

// Given an Array or Object,
// return LAMOS,
// sorting all Map keys.
export function sorted (data) {
  return recurse(data, 0, true)
}

function recurse (data, indent, sortKeys, withinList) {
  const prefix = '  '.repeat(indent)
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('Cannot serialize empty array.')
    }
    return data
      .map((element, index) => {
        const firstElement = index === 0
        element = coerce(element)
        if (typeof element === 'string') {
          if (element.length === 0) {
            throw new Error('Cannot serialize empty string.')
          } else if (element.indexOf('\n') !== -1) {
            throw new Error('Cannot serialize string with newline')
          }
          if (withinList && firstElement) {
            return '- ' + escapeValue(element)
          } else {
            return prefix + '- ' + escapeValue(element)
          }
        } else {
          if (withinList && firstElement) {
            return (
              '- ' + recurse(element, indent + 1, sortKeys, true)
            )
          } else {
            return (
              prefix + '- ' +
              recurse(element, indent + 1, sortKeys, true)
            )
          }
        }
      })
      .join('\n')
  } else {
    const keys = Object.keys(data)
    if (keys.length === 0) {
      throw new Error('Cannot serialize empty object.')
    }
    return (sortKeys ? keys.concat().sort() : keys)
      .map(function (key, index) {
        const value = coerce(data[key])
        const firstElement = index === 0
        if (typeof value === 'string') {
          if (withinList && firstElement) {
            return key + ': ' + value
          } else {
            return prefix + key + ': ' + value
          }
        } else if (Array.isArray(value)) {
          if (withinList && firstElement) {
            return (
              key + ':\n' +
              recurse(value, indent, sortKeys, false)
            )
          } else {
            return (
              prefix + key + ':\n' +
              recurse(value, indent, sortKeys, false)
            )
          }
        } else {
          if (withinList && firstElement) {
            return (
              key + ':\n' +
              recurse(value, indent + 1, sortKeys, false)
            )
          } else {
            return (
              prefix + key + ':\n' +
              recurse(value, indent + 1, sortKeys, false)
            )
          }
        }
      })
      .join('\n')
  }
}

function escapeValue (string) {
  return string
    .replace(/(.): (.)/g, '$1\\: $2')
    // Any unescaped ":" at end would denote a map key.
    .replace(/:$/g, '\\:')
    // A leading, unescaped "- " would denote a nested list and item.
    .replace(/^- /, '\\- ')
}

function coerce (value) {
  if (value === null) return 'null'
  const type = typeof value
  if (type === 'boolean' || type === 'number') {
    return value.toString()
  }
  return value
}
