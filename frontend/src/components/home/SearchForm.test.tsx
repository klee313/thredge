import { fireEvent, render, screen } from '@testing-library/react'
import { SearchForm } from './SearchForm'

describe('SearchForm', () => {
  it('trims whitespace on submit', () => {
    const onSearch = vi.fn()
    const { container } = render(
      <SearchForm
        value="  hello  "
        onChange={() => {}}
        onSearch={onSearch}
        onClear={() => {}}
      />,
    )

    const form = container.querySelector('form')
    if (!form) {
      throw new Error('SearchForm: form element not found')
    }
    fireEvent.submit(form)
    expect(onSearch).toHaveBeenCalledWith('hello')
  })
})
