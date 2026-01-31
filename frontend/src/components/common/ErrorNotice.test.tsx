import { render, screen } from '@testing-library/react'
import { ErrorNotice } from './ErrorNotice'

describe('ErrorNotice', () => {
  it('renders message with status role', () => {
    render(<ErrorNotice message="Something went wrong" />)
    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('Something went wrong')
  })

  it('appends custom className', () => {
    render(<ErrorNotice message="Oops" className="extra-class" />)
    const notice = screen.getByRole('status')
    expect(notice).toHaveClass('extra-class')
  })
})
