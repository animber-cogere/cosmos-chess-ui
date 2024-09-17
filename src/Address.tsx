import { MouseEvent, useRef } from "react";

export interface AddressProps {
  address?: string;
}

export function Address(props: AddressProps) {
  const el = useRef<HTMLElement | null>(null);

  function onClick(e: MouseEvent<HTMLElement>) {
    const address = el.current;
    if (!address) {
      return;
    }
    e.preventDefault();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(address);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return (
    <code className="address" onClick={onClick} ref={el}>
      {props.address}
    </code>
  );
}
