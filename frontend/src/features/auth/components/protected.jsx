import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

const Protected = ({children}) => {
  const {user, loading} = useSelector(state => state.auth);
  
  if (loading) {
    return <LoadingScreen />;
  }

  if(!user){
    return <Navigate to="/login"></Navigate>
  }
  
    return children;
}
export default Protected
