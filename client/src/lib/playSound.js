const playSound = (src)=>{
    const audio = new Audio(src);
    audio.play().catch((err) => console.log("Audio play error:", err));
}

export default playSound;