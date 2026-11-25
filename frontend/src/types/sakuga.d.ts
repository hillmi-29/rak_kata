export interface SakugaButtonElement extends HTMLElement {
  done(hold?: number): void;
  impact(): void;
  disabled: boolean;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'sakuga-button': React.DetailedHTMLProps<
        React.HTMLAttributes<SakugaButtonElement>,
        SakugaButtonElement
      > & {
        variant?: 'primary' | 'secondary';
        type?: 'button' | 'submit';
        disabled?: boolean;
      };
    }
  }
}
