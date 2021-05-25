import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

import { FaCalendar, FaUser, FaClock } from 'react-icons/fa'
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

   // TITULO
   const titleCount = post.data.title.split(' ').length;

   // HEADING DA POSTAGEM
   const headingCount = post.data.content.map(
     content => content.heading.split(' ').length
   );
 
   const resultHeading = headingCount.reduce((accum, curr) => accum + curr);
 
   // BODY DA POSTAGEM
   const bodyCount = post.data.content.map(
     content => RichText.asText(content.body).split(' ').length
   );
 
   const resultBody = bodyCount.reduce((accum, curr) => accum + curr);
 
   const totalWord = Math.ceil((titleCount + resultHeading + resultBody) / 200);

  return (
    <>
      <Header />
      <img className={styles.img}src={post.data.banner.url} alt="imagem" />
      <main className={`${commonStyles.container} ${styles.container}`}>
        <strong>{post.data.title}</strong>
        <div className={styles.infoContainer}>
          <time><FaCalendar className={styles.icon}/>{format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}</time>
          <span><FaUser className={styles.icon}/>{post.data.author}</span>
          <span><FaClock className={styles.icon}/>{totalWord} min</span>
        </div>

        {post.data.content.map(content => {
          return (
            <main key={content.heading} className={styles.container}>
              <article className={styles.post}>
                <h2>{content.heading}</h2>
                <div className={styles.postBody} dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}} />
              </article>
            </main>
          )
        })}
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    }
  }

  return {
    props: {
      post
    }
  }
};
