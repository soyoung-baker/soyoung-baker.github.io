import { Metadata } from 'next'

import PostList from '@/components/home/PostList'

export const metadata: Metadata = {
  title: 'Home | Better code coffee 블로그',
  description: '전체 포스트 목록을 볼 수 있습니다.',
}

export default function Home() {
  return <PostList />
}
