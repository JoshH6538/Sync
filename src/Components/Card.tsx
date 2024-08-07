import { ReactNode } from "react";

interface Props {
    children: ReactNode
}

export default function Card({children}: Props) {
  return (
    <>
        <div className="card">
          <img src="https://i.scdn.co/image/9f9b40704e3361c93ea8a8b7a86a5d9ee755466e" className="card-img-top" alt="jim"></img>
          <div className="card-body">
        <p className="card-text">{children}</p>
          </div>
        </div>
    </>
  )
}
