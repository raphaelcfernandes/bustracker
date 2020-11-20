import TableBody from './body'
import TableHeader from './header'

const Table = ({ data, head, onClick }) => (
    <table style={{borderColor: "black", overflowY:"scroll", height:"100%", display:"block"}}>
        <TableHeader head={head} />
        <TableBody data={data} onClick={onClick} />
    </table>
)

export default Table;