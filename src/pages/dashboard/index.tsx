import { GetServerSideProps } from 'next';
import { ChangeEvent, FormEvent, useState, useEffect, } from "react";
import styles from '../../pages/dashboard/dashboard.module.css';
import Head from 'next/head';

import { db } from '../../services/firebaseConnection';
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc, } from 'firebase/firestore';

import { getSession } from 'next-auth/react';
import { Textarea } from '../../components/textarea';
import Link from 'next/link';

import { FiShare2 } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

interface HomeProps{
    user: {
        email: string
    }
}

interface TasksProps{
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps){

    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TasksProps[]>([])

    useEffect(() => {
        async function loadTasks(){
            const tarefasRef = collection(db, "tasks")
            const q = query(
                tarefasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let lista = [] as TasksProps[];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public,
                    })
                })
                setTasks(lista);
            })
        }

        loadTasks();
    }, [user?.email])


    function handleChangePublic(e:ChangeEvent <HTMLInputElement> ){
        console.log(e.target.checked)
        setPublicTask(e.target.checked)

    }


    async function handleRegisterTask(e: FormEvent){
        e.preventDefault();

        if(input === "") return;

        try{
            await addDoc(collection(db, "tasks"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask,
            });

            setInput("");
            setPublicTask(false);
        }catch{
            console.log("Erro ao listar tarefa no banco de dados")
        }

    }

    async function handleShare(id: string){
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/tasks/${id}`
        );

    }

    async function handleDeleteTask(id: string){
        const docRef = doc(db, "tasks", id)
        await deleteDoc(docRef);
    }

    return(
        <div className={styles.container}>
            
            <Head>
                <title>Meu painel de Tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>
                            Qual sua tarefa?
                        </h1>

                        <form onSubmit={ handleRegisterTask }>
                            <Textarea
                            placeholder='Digite qual sua tarefa'
                            value={input}
                            onChange={(e: ChangeEvent < HTMLTextAreaElement >) => {
                                setInput(e.target.value)
                            }}  
                            />
                            <div className={styles.checkBoxArea}>
                                <input 
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={ publicTask }
                                    onChange={ handleChangePublic }
                                />

                                <label>
                                    Deixar tarefa pública
                                </label>
                            </div>

                            <button type='submit' className={styles.button}>Registrar</button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>

                    {tasks.map((item) => (
                        <article className={styles.task} key={item.id}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                <label className={styles.tag}>Público</label>
                                <button className={styles.shareButton} onClick={() => handleShare(item.id) }>
                                    <FiShare2
                                        size={22}
                                        color="#3183ff"
                                    />
                                </button>
                            </div>
                            )}
                            <div className={styles.taskContent}>
                                
                                {item.public ?(
                                    <Link href={`/task/${item.id}`}>
                                    <p>{item.tarefa}</p>
                                    </Link>
                                ): (
                                    <p>{item.tarefa}</p>
                                )}
                                <button className={styles.trash} onClick={() =>{ handleDeleteTask(item.id) }}>
                                <FaTrash
                                    size={24}
                                    color='#ea3140'
                                />
                                </button>
                                </div>
                        </article>
                    ))}
                </section>



            </main>
        </div>
    )
}



export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req })
        ////console.log(session)
            /// se não tiver usuário logado, vamos redirecionar para home
        if(!session?.user){
            return{
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }



    return{
        props: {
            user: {
                email: session?.user?.email,
            }
        }
    }
}