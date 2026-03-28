import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const Protected = ({children}) => {
  const {user, loading} = useSelector(state => state.auth);
  
  if (loading) {
    return <div><center><h1>Loading...</h1></center></div>
  }

  if(!user){
    return <Navigate to="/login"></Navigate>
  }
  
    return children;
}
export default Protected
