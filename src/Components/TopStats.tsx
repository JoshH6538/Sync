import Card from './Card'
import '../Styles/TopStats.css'

interface Props {
    stats: any,
    title: string
}

export default function TopStats({stats, title}: Props) {
    let num=0;
  return (
    <div className='stats-container'>
        <div className='stats-header-container'>
            <h1 className='stats-header'>{title}</h1>
        </div>
        <div className="grid">
        {stats.map((stat: any) => {
            return(
                <div key={stat.id}>
                    {stat.images.length > 0 ? <Card text={stat.name} img={stat.images[0].url} altnum={num++}></Card>
                    : <Card text={stat.name} img='src\Images\placeholder.jpg' altnum={num++}></Card>}
                </div>
            )
        })}
        </div>
    </div>
  )
}
