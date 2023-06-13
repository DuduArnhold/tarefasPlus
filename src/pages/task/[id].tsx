import { useState, ChangeEvent, FormEvent} from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';
import { db } from '../../services/firebaseConnection';
import {
    doc,
    collection,
    query,
    where,
    getDoc,
    Timestamp,
    addDoc,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';

import { Textarea } from '../../components/textarea';
import { FaTrash } from 'react-icons/fa';

interface TaskProps {
    item: {
        tarefa: string;
        created: string;
        public: boolean;
        user: string;
        TaskId: string;
    };
    allComments: commentsProps[];
}

interface commentsProps{
    id: string;
    Comment: string;
    TaskId: string;
    user: string;
    name: string;
}



export default function Task({ item, allComments, }: TaskProps){

    const { data: session } = useSession();

    const [input, setInput] = useState("");

    const [comments, setComments] = useState<commentsProps[]>(allComments || []);




    async function handleComment(event: FormEvent){
        event.preventDefault();
        if(input === "") return;

        if(!session?.user?.email || !session?.user?.name) return;

        try{
            const docRef = await addDoc(collection(db, 'comments'), {
                Comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.TaskId
            });

            const data = {
                id: docRef.id,
                Comment:  input,
                user: session?.user?.email,
                name: session?.user.name,
                TaskId: item?.TaskId
            };

            setComments((oldItems) => [...oldItems, data])



            setInput("");

        }catch(err){
            console.log(err)
        }
    }

    async function HandleDeleteComment( id: string){
        try{
            const docRef = doc(db, "comments", id)
            await deleteDoc(docRef);
            const deleteComment = comments.filter((item) => item.id !== id )


            setComments(deleteComment);
        }catch(err){
            console.log(err)
        }
    }

        

    return(
        <div className={styles.container}>
            <Head>
                <title>Detalhes da Tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar Comentário</h2>

                <form onSubmit={ handleComment }>
                    <Textarea
                    value={input}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput((event.target.value))}
                    placeholder='Digite seu comentário'
                    />


                    <button 
                    className={styles.button}
                    disabled={!session?.user}
                    >
                        Enviar comentário
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos os comentários</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentário encontrado...</span>
                )}


                {comments.map((item) => (
                    <article className={styles.comment} key={item.id}>
                        <div className={styles.headComment}>
                           
                           <label className={ styles.commentsLabel }>{ item.name }</label>
                            {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={ () => HandleDeleteComment(item.id) }>
                                <FaTrash
                                    size= {18}
                                    color= '#EA3140'
                                />
                            </button>
                            )}

                        </div>
                        <p>{ item.Comment }</p>
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "tasks", id)

    const q = query(collection(db, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)

    let allComments: commentsProps[] = []

    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            Comment: doc.data().Comment,
            user: doc.data().user,
            name: doc.data().name,
            TaskId: doc.data().taskId,
        })
    })

    

    const snapshot = await getDoc(docRef)

    if(snapshot.data() === undefined){
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    if(!snapshot.data()?.public){
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }


    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        User: snapshot.data()?.user,
        TaskId: id,

    }
    
    
    return{
        props: {
            item: task,
            allComments: allComments,
        }
    }
}