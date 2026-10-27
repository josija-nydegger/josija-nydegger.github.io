// Atom feed of the English posts: /en/feed.xml
import { atomFeed } from '../../lib/feed';

export const GET = () => atomFeed('en');
