import styles from "../style/conversationPanel.module.css"
import icon from "../assets/icon.png"
import {useEffect, useState} from "react";
import {getThreads, changeStatusThread} from "../datacalls/threadcalls.jsx"

let Customers = [
    { id: 1, email: "kaylen.weber@gmail.com", name: "Kaylen", lang: "de" }
]


function ConversationPanel({setCustomerId}){
    const [customers, setCustomers] = useState(Customers)

    useEffect(() => {
        const timer = setTimeout(() => {
            setCustomers(prev => [

                { id: 2, email: "tristan.moreau@gmail.com", name: "Tristan", lang: "en" },
                ...prev
            ])
        }, 5000)

        return () => clearTimeout(timer)
    }, [])


    return(
        <div className={styles.panel}>
            <div className="header">Conversation</div>
            <div className={styles.conversationContent}>
                {customers.map(user => {
                    return <User id={user.id} key={user.id} name={user.name} language={user.lang} onclick={setCustomerId}></User>
                })}

            </div>
        </div>
    )
}


function User({id, name, language, onclick}){
    let thread = getThreads(id);
    return(
            <button style={{fontWeight: thread.status === "NEW" ? "1000" : "inherit", color:  thread.status === "NEW" ? "indianred" :"inherit"}}
                    onClick={()=>{onclick(id); changeStatusThread(thread)}} className={styles.user}>
                <img src={icon} alt="winnie the pooh" width={"50px"} height={"50px"}/>
                <div className={styles.userText}>
                    <h3>{name}</h3>
                    <p>{language}</p>
                </div>
            </button>
        )

}

export {ConversationPanel}