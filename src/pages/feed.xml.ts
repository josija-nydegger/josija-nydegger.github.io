// Atom-Feed der deutschen Beiträge: /feed.xml
import { atomFeed } from '../lib/feed';

export const GET = () => atomFeed('de');
