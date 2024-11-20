import { Header } from '@/components/Header';
import { gql } from '@apollo/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/lib/apollo';
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { RichText } from "@graphcms/rich-text-react-renderer";
import { ElementNode } from "@graphcms/rich-text-types";

const GET_POST = gql`
  query GetPost($slugPost: String) {
    post(where: { slug: $slugPost }) {
      id
      title
      slug
      subtitle
      coverImage {
        url
      }
      content {
        json
      }
      coverImage2 {
        url
      }
      content2 {
        json
      }
      author {
        name
      }
      createdAt
    }
  }
`;

interface PostProps {
  post: {
    id: string;
    title: string;
    slug: string;
    subtitle: string;
    coverImage?: {
      url: string;
    };
    content: {
      json: ElementNode[];
    };
    coverImage2?: {
      url: string;
    };
    content2?: {
      json: ElementNode[];
    };
    author: {
      name: string;
    };
    createdAt: string;
  };
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | Brasil Concursos</title>
        <meta name="description" content={post.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className='w-full max-w-[1120px] flex flex-col mx-auto pb-12 px-4'>
        <Header />

        <Link
          href="/"
          className='flex w-full max-w-fit font-bold text-zinc-900 hover:text-zinc-600'
        >
          Voltar
        </Link>
        
        <div className='w-full h-full flex flex-col mt-8'>
          {post.coverImage && post.coverImage.url && (
            <div className='flex w-full h-56 sm:h-80 lg:h-[392px] relative rounded-2xl overflow-hidden'>
              <Image 
                src={post.coverImage.url}
                alt={post.title}
                fill={true}
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div className='flex w-full flex-col mt-4 sm:mt-8'>
          <h1 className='font-bold text-2xl sm:text-4xl lg:text-[40px] text-blue-600'>{post.title}</h1>
          <h2 className='mt-4 text-xl text-zinc-800'>{post.subtitle}</h2>
          <div>
            <p className='font-bold text-zinc-900'>{post.author.name}</p>
            <p className='text-zinc-600 text-sm'>{format(new Date(post.createdAt), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}</p>
          </div>


          <div className='mt-4 sm:mt-8'>
            <RichText 
              content={post.content.json} 
              renderers={{
                p: ({ children }) => <p className='text-zinc-600 text-sm sm:text-base text-justify lg:text-left mt-1'>{children}</p>
              }}
            />
          </div>
{/* ------------------------------------------------------------------- */}
          {post.coverImage2 && post.coverImage2.url && (
            <div className='w-full h-full flex flex-col mt-8'>
              <div className='flex w-full h-56 sm:h-80 lg:h-[392px] relative rounded-2xl overflow-hidden'>
                <Image 
                  src={post.coverImage2.url}
                  alt={post.title}
                  fill={true}
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          )}

          <div className='mt-4 sm:mt-8'>
            {post.content2?.json && (
              <RichText 
                content={post.content2.json} 
                renderers={{
                  p: ({ children }) => <p className='text-zinc-600 text-sm sm:text-base text-justify lg:text-left mt-1'>{children}</p>
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const slug = ctx.params?.slug;

  try {
    const { data } = await client.query({
      query: GET_POST,
      variables: {
        slugPost: slug,
      },
    });

    // Verifique se data e data.post estão definidos
    if (!data || !data.post) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        post: data.post,
      },
      revalidate: 60 * 30, // 30 min
    };
  } catch (error) {
    // Lidar com erros na requisição
    console.error("Error fetching post data:", error);
    return {
      notFound: true,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: 'como-desenvolver-um-blog-com-nextjs' }},
    ],
    fallback: 'blocking',
  };
};