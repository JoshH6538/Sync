import { ReactNode } from "react";

interface Props {
    children?: ReactNode;
    color?: 'primary' | 'secondary' | 'dark';
    onClick: any
}


const Button = ({children, color = 'primary',onClick}: Props) => {
    return (
        <button className={"btn btn-"+color} onClick={onClick}>{children}</button>
  )
}

export default Button