import React, { Fragment, useMemo, useState } from 'react';
import { useTable, useSortBy } from 'react-table';
//import DisplayData from './DisplayData';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Table.css';
//import Swal from 'sweetalert2';
import { Dropdown } from 'react-bootstrap';
import * as XLSX from 'xlsx';

// Hardcoded data
const hardcodedData = [
  { Id: 1, Name: 'John Doe', Age: 28, Country: 'USA' },
  { Id: 2, Name: 'Jane Smith', Age: 34, Country: 'Canada' },
  { Id: 3, Name: 'Alice Johnson', Age: 45, Country: 'UK' },
  { Id: 4, Name: 'Bob Brown', Age: 23, Country: 'Australia' },
];

const Table = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [data, setData] = useState(hardcodedData);
  const [selectedFormat, setSelectedFormat] = useState('json');

  const handleCheckboxChange = (row) => {
    const rowId = row.original.Id;
    setSelectedRows(prevSelected => {
      const isSelected = prevSelected.includes(rowId);
      const updatedSelected = isSelected
        ? prevSelected.filter(id => id !== rowId)
        : [...prevSelected, rowId];

      const updatedData = data.filter(item => updatedSelected.includes(item.Id));
      setSelectedData(updatedData);

      return updatedSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
      setSelectedData([]);
    } else {
      const allIds = data.map(row => row.Id);
      setSelectedRows(allIds);
      setSelectedData(data);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: () => (
          <button onClick={handleSelectAll} className="custom-btn2">
            <b>Select</b>
          </button>
        ),
        accessor: 'select',
        Cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.original.Id)}
            onChange={() => handleCheckboxChange(row)}
          />
        ),
        disableSortBy: true,
      },
      {
        Header: 'Identity',
        accessor: 'Id',
      },
      {
        Header: 'Name',
        accessor: 'Name',
      },
      {
        Header: 'Age',
        accessor: 'Age',
      },
      {
        Header: 'Country',
        accessor: 'Country',
      },
    ],
    [data, selectedRows]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  const addData = () => {
    // Navigate to add data page
  };

  const deleteData = () => {
    // Handle deletion logic
    //Swal.fire({ title: 'Deleted' });
  };

  const downloadTable = (format) => {
    let dataToDownload;
    let blob;

    const headers = headerGroups[0].headers
      .filter(column => column.Header !== null && typeof column.Header === 'string')
      .map(column => column.Header);

    if (format === 'json') {
      dataToDownload = JSON.stringify(data, null, 2);
      blob = new Blob([dataToDownload], { type: 'application/json' });
    } else if (format === 'text') {
      dataToDownload = [
        headers.join(', '),
        ...data.map(row => Object.values(row).join(', '))
      ].join('\n');
      blob = new Blob([dataToDownload], { type: 'text/plain' });
    } else if (format === 'xlsx') {
      const filteredData = data.map(row => {
        const newRow = {};
        headers.forEach((header, index) => {
          newRow[header] = Object.values(row)[index];
        });
        return newRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(filteredData, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      const binaryString = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

      const buffer = new ArrayBuffer(binaryString.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < binaryString.length; i++) {
        view[i] = binaryString.charCodeAt(i) & 0xFF;
      }

      blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-data.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSelect = (format) => {
    setSelectedFormat(format);
    downloadTable(format);
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-center mb-3">
        <button onClick={() => setData(hardcodedData)} className="custom-btn">
          Fetch Data
        </button>
        <button onClick={deleteData} className="custom-btn3">
          Delete
        </button>
        <button onClick={addData} className="custom-btn">
          Add Data
        </button>
      </div>
      <div className="container mt-4">
        <b>Download</b>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {selectedFormat.toUpperCase() || 'Select Format'}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleDownloadSelect('json')}>
              JSON
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDownloadSelect('text')}>
              Text
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleDownloadSelect('xlsx')}>
              Excel
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className="table-container">
        <table {...getTableProps()} className="table table-bordered table-dark">
          <thead className="thead-dark">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="text-center"
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      className="text-center"
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* <DisplayData selectedData={selectedData} /> */}
    </Fragment>
  );
};

export default Table;
