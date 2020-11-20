const TableHeader = ({ head }) => (
    <thead>
        <tr>
            {head.map(x => (
                <th key={x} >{x}</th>
            ))}
        </tr>
    </thead>
)

export default TableHeader