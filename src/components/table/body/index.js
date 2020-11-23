const TableBody = ({ data, onClick }) => (
    <tbody>
        {data.map(x => (
            <tr key={x.rtdd} style={{ mixBlendMode: "difference", backgroundColor: x.rtclr }} >
                <td>
                    {x.rt}
                </td>
                <td>
                    {x.rtnm}
                </td>
                <td>
                    <input type="checkbox" value={x.rt} name={x.rt} onClick={(e) => onClick(e,x)} />
                </td>
            </tr>
        ))}
    </tbody>
)

export default TableBody