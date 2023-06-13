import Head from 'next/head'
import styles from '@/styles/home.module.css'
import Image from 'next/image'
import heroImg from '../../public/assets/hero.png'
import { GetStaticProps } from 'next'

import { collection, getDocs,  } from 'firebase/firestore'
import { db } from '../services/firebaseConnection'


interface HomeProps{
  posts: number;
  comments: number;
}



export default function Home( {posts, comments}: HomeProps ) {
  return(
    <div className={styles.container}>
      <Head>
        <title>Tarefas+  |  Organize suas tarefas de forma fácil</title>
      </Head>


    <main className={styles.main}>
      <div className={styles.logoContent}>
        <Image 
          className={styles.hero}
          alt='Logo tarefas+'
          src={heroImg}
          priority
        />
      </div>
        <h1 className={styles.title}>
          Sistema feito para você organizar <br/> 
          seus e estudos e tarefas.</h1>
      <div className={styles.infoContent}>
        <section className={styles.box}>+ {posts} Posts</section>
        <section className={styles.box}>+ {comments} Comentários</section>
      </div>
      </main>
    
    </div>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  
  // buscar do banco de daodos e mandar para o componente


  const commentRef = collection(db, "comments")
  const postRef = collection(db, "tasks")

  const commentSnapshot = await getDocs(commentRef)
  const postSnapshot = await getDocs(postRef)
  
  return{
    props:{
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60 //revalida os dados a cada 60 segundos
  }
}