export interface SakugaButtonElement extends HTMLElement {
  done(hold?: number): void;
  impact(): void;
  disabled: boolean;
}

export interface SakugaCheckboxElement extends HTMLElement {
  checked: boolean;
  disabled: boolean;
  value: string;
  name: string;
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
      'sakuga-checkbox': React.DetailedHTMLProps<
        React.HTMLAttributes<SakugaCheckboxElement>,
        SakugaCheckboxElement
      > & {
        checked?: boolean;
        disabled?: boolean;
        name?: string;
        value?: string;
      };
    }
  }
}
