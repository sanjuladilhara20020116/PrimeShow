
import { createContext, useContext, useEffect, useState } from "react";
import axios  from "axios";
import {useAuth, useUser } from '@clerk/clerk-react';
import {useLocation, useNavigate} from 'react-router-dom';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext()

export const AppProvider = ({ children })=>{

  const[isAdmin, setIsAdmin] = useState(false)
  const[shows, setShows] = useState([])
  const[favoriteMovies, setfavoriteMovies] = useState([])

  const {user} = useUser()
  const {getToken} = useAuth()
  const {location} = useLocation()
  const {navigate} = useNavigate()

  
  

  const fetchIsAdmin = async ()=>{
    try{
      const {data}=await axios.get('/api/admin/is-admin' , {headers:
        {Authorization: `Bearer ${await getToken()} `}})
        setIsAdmin(Date.isAdmin)

        if(!data.isAdmin && location.pathame.startsWith('/admin')){
          navigate('/')
          toast.error('You are not authorized to access admin dashboard')

        }
    }catch (error){
      console.error(error)
    }
  }


  const fetchShows = async () =>{
    try{
      const {data} = await axios.get('/api/show/all')
      if(data.success){
        setShows(data.shows)
      }else{
        toast.error(data.message)
      }
    }catch (error){
      console.error(error)
    }
  }


  const fetchFavoriteMovies = async () => {
  try {
    const { data } = await axios.get('/api/user/favorites', {
      headers: {
        Authorization: `Bearer ${await getToken()}`
      }
    })

    if (data.success) {
      setFavoriteMovies(data.movies)
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    console.error(error)
  }
}

  useEffect(()=>{
    
      fetchIsShows()
      fetchFavoriteMovies()
    
  },[])

  useEffect(()=>{
    if(user){
      fetchIsAdmin()
      
    }
  },[user])

    const value = {
      axios,
      fetchIsAdmin,
      user, getToken, navigate, isAdmin, shows,
      favoriteMovies, fetchFavoriteMovies
    
    
    
    }

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)








































/* 
// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {




  const backendUrl = "http://localhost:3000";
  
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync state to localStorage whenever 'user' changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
    } else {
      localStorage.removeItem("userData");
    }
  }, [user]);

  // Simplified login function that accepts the user object from Login.jsx
  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userData");
    toast.success("Logged out successfully");
  };






  return (
    <AppContext.Provider value={{ backendUrl, user, setUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};
*/