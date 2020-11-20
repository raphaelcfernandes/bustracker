const TableBody = ({ data, onClick }) => (
    <tbody>
        {data.map(x => (
            <tr key={x.rtdd} style={{ mixBlendMode:"difference", backgroundColor: x.rtclr }} onClick={() => onClick(x)}>
                <td>
                    {x.rt}
                </td>
                <td>
                    {x.rtnm}
                </td>
            </tr>
        ))}
    </tbody>
)

export default TableBody