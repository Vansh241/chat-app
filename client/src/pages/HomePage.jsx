import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import RightSidebar from '../components/RightSidebar.jsx'
import ChatContainer from '../components/ChatContainer.jsx'
import { ChatContext } from '../context/ChatContext.jsx';

function Homepage() {
    const {selectedUser, selectedProfile} = useContext(ChatContext);
  return (
    // sm:px-[15%] sm:py-[5%]
    // border
    <div className=' w-full h-screen '> 
        <div className={`backdrop-blur-xl overflow-hidden h-full grid grid-cols-1 relative
          ${
            selectedUser
              ? selectedProfile
                ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]" // Sidebar + Chat + RightSidebar
                : "md:grid-cols-[1.2fr_2fr] xl:grid-cols-[1.3fr_3fr]" // Sidebar + Wide Chat
              : "md:grid-cols-2" // Only Sidebar visible
          }
        `}>
        {/* <div className={`backdrop-blur-xl overflow-hidden h-[100%] grid grid-cols-1 relative ${(selectedUser && selectedProfile ) ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}> */}
            <Sidebar />
            <ChatContainer />
            <RightSidebar />
        </div>
    </div>
  )
}

export default Homepage
