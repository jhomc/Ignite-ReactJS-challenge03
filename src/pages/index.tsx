import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';
import Link from 'next/link';
import { FaCalendar, FaUser } from 'react-icons/fa'

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';
import { useState } from 'react';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)

  async function handleNextPage (): Promise<void> {
    if(nextPage === null) {
      return;
    }

    const postResult = await fetch(`${nextPage}`).then(response =>
      response.json());

    const newPost = postResult.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          slug: post.uid,
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    setPosts([...posts, ...newPost])
    setNextPage(postResult.next_page)
  }

  return (
    <>
      <Header />

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.infoContainer}>
                  <time><FaCalendar className={styles.icon}/>{format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR})}</time>
                  <span><FaUser className={styles.icon}/>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button type="button" onClick={handleNextPage}>Carregar mais posts</button>
            )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ],
    {
      fetch: ['post.title', 'post.content', 'post.author', 'post.subtitle'],
      pageSize: 1
    });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: { results, next_page: postsResponse.next_page }
    }
  }

};
