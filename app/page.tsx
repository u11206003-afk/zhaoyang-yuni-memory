import { requireChatGPTUser } from './chatgpt-auth';
import MemoryApp from './MemoryApp';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  await requireChatGPTUser('/');
  return <MemoryApp />;
}

