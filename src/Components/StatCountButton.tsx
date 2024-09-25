interface Props {
    color?: 'primary' | 'secondary' | 'dark' | 'danger';
    onClick: any
}


const StatCountButton = ({color = 'danger',onClick}: Props) => {
    return (
        <div className="btn-group" role="group" aria-label="Basic example">
            <button type="button" className={"btn btn-"+color} onClick={()=>{onClick(10)}}>10</button>
            <button type="button" className={"btn btn-"+color} onClick={()=>{onClick(20)}}>20</button>
            <button type="button" className={"btn btn-"+color} onClick={()=>{onClick(50)}}>50</button>
        </div>
  )
}

export default StatCountButton;