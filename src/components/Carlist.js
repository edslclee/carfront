import React, { useEffect, useState } from 'react'
import { SERVER_URL } from '../constants.js';
import { Snackbar, Stack } from '@mui/material';
import AddCar from './AddCar.js';
import EditCar from './EditCar.js';
import { DataGrid, GridToolbarContainer, GridToolbarExport, gridClasses } from '@mui/x-data-grid';
import IconButton	from	'@mui/material/IconButton';
import DeleteIcon	from	'@mui/icons-material/Delete';


function CustomToolbar() {
  return (
    <GridToolbarContainer
      className={gridClasses.toolbarContainer}>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
  
function Carlist() {
  const [cars , setCars] = useState([]);

  //for datagrid
  const columns = [
    {field: 'brand', headerName: 'Brand', width: 200},
    {field: 'model', headerName: 'Model', width: 200},
    {field: 'color', headerName: 'Color', width: 200},
    {field: 'year', headerName: 'Year', width: 150},
    {field: 'price', headerName: 'Price', width: 150},
    {
      field: '_links.car.href',
      headerName: '',
      sortable: false,
      filterable: false,
      renderCell: row =>
      <EditCar
        data={row}
        updateCar={updateCar} />
    }, 
    {
      field: '_links.self.href',
      headerName: '',
      sortable: false,
      filterable: false,
      renderCell: row =>
        <IconButton onClick={() => onDelClick (row.id)}>
          <DeleteIcon color="error" />
        </IconButton>
    }   
  ];

  //for snackBar
  const [open, setOpen] = useState(false);

  const onDelClick = (url) => {
    if (window.confirm("Are you sure to delete?")){
      const token = sessionStorage.getItem("jwt"); 
      fetch(url,	{
        method:	'DELETE',
        headers: { 'Authorization' : token }
      })
      .then(response => {
        if (response.ok){
          fetchCars();
          setOpen(true)
        }else {
          alert('삭제에 실패했습니다');
        }
      })
      .catch(err => console.error(err))
    }
  }
    
  useEffect (()=>{
    fetchCars();
  }, []);

  //useEffect에서 fetch부분을 독립
  const fetchCars = () => {
    // Read the token from the session storage
    // and include it to Authorization header
    const token = sessionStorage.getItem("jwt");

    fetch(SERVER_URL + 'api/cars', {
        headers: { 'Authorization' : token}
        } )
        .then(response => response.json())
        .then(data => setCars(data._embedded.cars))
        .catch(err => console.error(err));
  }
  
  // Add a new car
  const addCar = (car) => {
    const token = sessionStorage.getItem("jwt");
    fetch(SERVER_URL	+	'api/cars',
     {
        method: 'POST',
        headers: { 
          'Content-Type':'application/json',
          'Authorization' : token
        },
        body: JSON.stringify(car)
     })
    .then(response => {
      if (response.ok) {
          fetchCars();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  } 
  
  // Update car
  const updateCar = (car, link) => {
    const token = sessionStorage.getItem("jwt");
    fetch(link,
    {
      method: 'PUT',
      headers: { 
        'Content-Type':	'application/json',
        'Authorization' : token
      },
      body: JSON.stringify(car)
    })
    .then(response => {
      if (response.ok) {
        fetchCars();
      }
      else {
        alert('Something went wrong!');
      }
    })
    .catch(err => console.error(err))
  }
  
  return (
    //<React.Fragment> = <>
    <>
      <Stack mt={2} mb={2}>
            <AddCar addCar={addCar} />
      </Stack>
      {/*<AddCar addCar={addCar} /> */}
      <div style={{ height: 500, width: '100%' }}>
        {/* mui datagrid사용전
        <table>
          <tbody>
              {cars.map((car, index)=>
                <tr key={index}>
                  <td>{car.brand}</td>
                  <td>{car.model}</td>
                  <td>{car.color}</td>
                  <td>{car.year}</td>
                  <td>{car.price}</td>
                </tr>  
              )
            }
          </tbody>
        </table>
          */}
        <DataGrid
          rows={cars}
          columns={columns}
          disableSelectionOnClick={true}
          getRowId={row => row._links.self.href}
          components={{ Toolbar: CustomToolbar }}
          />
        <Snackbar
          open={open}
          autoHideDuration={2000}
          onClose={() => setOpen(false)}
          message="Car deleted" />
      </div>
    </>
  )
}

export default Carlist
