import { getAllInbox, getUnreadInbox } from "@/lib/queries";
import InboxClient from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const items = await getAllInbox();
  const unreadCount = items.filter((i) => !i.read).length;
  return <InboxClient items={items} unreadCount={unreadCount} />;
}
