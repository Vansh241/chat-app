import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import playSound from "../lib/playSound.js";


export const ChatContext = createContext();

export const ChatProvider = ({children}) => {

    const [selectedProfile, setSelectedProfile] = useState(false);

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});  //key value pairs userid: number of unseen msgs

    const {axios, socket} = useContext(AuthContext);

    //function to get all users for side bar
    const getUsers = async () => {
        try {
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to get messages for the selected user
    const getMessages = async (userId) => {
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages, data.newMessage])
                playSound("/sounds/send_msg.mp3");
            }
            else{
                toast.error(data.message);
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }


    //function to subscribe to messages for selected user
    const subscribeToMessages = async () => {
        if(!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId]+1 : 1
                }))
                playSound("/sounds/receive_msg.mp3");
            }
        })
    }

    //function to unsubscribe from messages
    const unsubscribeFromMessages = () => {
        if(socket) socket.off("newMessage");
    }


    useEffect(()=>{
        subscribeToMessages();
        return () => unsubscribeFromMessages();

    },[socket, selectedUser]);


    const value = {
        sendMessage,
        getMessages,
        getUsers,
        users,
        messages,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        selectedProfile,
        setSelectedProfile
    }
    return(
        <ChatContext.Provider value={value}>
        {children}
        </ChatContext.Provider>
    )
}

