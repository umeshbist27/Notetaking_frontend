import "./app.css";
import React from 'react'; 
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./components/Home.js"
import 'typeface-poppins';
import NoteLayout from "./pages/NoteLayout.js";
import {Bounce, ToastContainer} from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
<>
<ToastContainer position="top-right"
autoClose={1500}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
transition={Bounce}/>

 <BrowserRouter>

    <Routes>

       <Route path="/" element={<Home/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/signup" element={<Signup/>}></Route>
      <Route path="/notes" element={<NoteLayout/>}></Route>
    </Routes>
    
    
    </BrowserRouter>
</>
   
    
  );
}

export default App;
