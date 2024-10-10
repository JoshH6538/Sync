interface Props {
    color?: 'primary' | 'secondary' | 'dark' | 'danger';
    onClick: any
}


const StatTimeButton = ({color = 'danger',onClick}: Props) => {
    return (
        <div className="btn-group" role="group" aria-label="Basic example">
            <button type="button" className={"btn btn-"+color} onClick={()=>{onClick('short_term')}}>1 Month</button>
            <button type="button" className={"btn btn-"+color} onClick={()=>{onClick('medium_term')}}>6 Months</button>
            <button type="button" className={"btn btn-"+color} onClick={()=>{onClick('long_term')}}>1 Year</button>
        </div>
  )
}

export default StatTimeButton;