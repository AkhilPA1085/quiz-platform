import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function Greeting() {
  return <h1>Quiz Platform</h1>;
}

describe('Greeting', () => {
  it('renders the heading', () => {
    render(<Greeting />);

    expect(
      screen.getByRole('heading', { name: 'Quiz Platform' }),
    ).toBeInTheDocument();
  });
});