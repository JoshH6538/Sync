import '../Styles/TriButton.css';
interface Props {
    color?: 'primary' | 'secondary' | 'dark' | 'danger';
    onClick: any
}


const StatCountButton = ({color = 'danger',onClick}: Props) => {
    return (
        <div className="count-container">
            <h3>Count</h3>
            <div className="btn-group tri-button" role="group" aria-label="Basic example">
                <button type="button" className={"btn btn-"+color} onClick={()=>{onClick(10)}}>10</button>
                <button type="button" className={"btn btn-"+color} onClick={()=>{onClick(20)}}>20</button>
                <button type="button" className={"btn btn-"+color} onClick={()=>{onClick(50)}}>50</button>
            </div>
        </div>
  )
}

export default StatCountButton;