<script lang="ts" setup>
import { liveQuery } from "dexie";
import { type Chat, db, type Message } from "~/services/db";

// Configuration: maximum characters for chat title before truncation
const MAX_TITLE_LENGTH = 80;

// State
type ChatWithTitle = Chat & { title: string };
const allChats = ref<ChatWithTitle[]>([]);
const visibleCount = ref(10);
const subscription = ref<{ unsubscribe: () => void } | undefined>(undefined);

const route = useRoute();
const { t } = useI18n();

/**
 * Truncate text with a three-dot postfix when exceeding max length.
 */
function truncateText(text: string, max: number): string {
    if (text.length <= max) return text;
    return `${text.slice(0, Math.max(0, max - 3))}...`;
}

/**
 * Fetch chats ordered by createdAt desc, and resolve first user message for title.
 */
async function fetchChatsWithTitles(): Promise<ChatWithTitle[]> {
    const chats = await db.chats.orderBy("createdAt").reverse().toArray();

    // Resolve first user message for each chat to build titles
    const withTitles = await Promise.all(
        chats.map(async (chat) => {
            // Earliest user message in this chat
            const firstMessages = await db.messages
                .where("chatId")
                .equals(chat.id)
                .sortBy("createdAt");

            const firstUser = firstMessages.find(
                (m: Message) => m.role === "user",
            );
            const base = firstUser?.content ?? t("chat.untitled");
            const title = truncateText(base, MAX_TITLE_LENGTH);
            return { ...chat, title };
        }),
    );

    return withTitles;
}

// Subscribe to chats via Dexie liveQuery
function subscribe(): void {
    if (subscription.value) {
        subscription.value.unsubscribe();
        subscription.value = undefined;
    }
    subscription.value = liveQuery(fetchChatsWithTitles).subscribe((chats) => {
        allChats.value = chats;
    });
}

onMounted(() => {
    subscribe();
});

onUnmounted(() => {
    if (subscription.value) subscription.value.unsubscribe();
});

// Only show the latest N chats by default
const visibleChats = computed<ChatWithTitle[]>(() => {
    return allChats.value.slice(0, visibleCount.value);
});

// Group chats by created date (YYYY-MM-DD) while preserving order
type ChatGroup = { dateKey: string; date: Date; chats: ChatWithTitle[] };
const groupedChats = computed<ChatGroup[]>(() => {
    const groups: Record<string, ChatGroup> = {};
    const ordered: ChatGroup[] = [];

    for (const chat of visibleChats.value) {
        const d = new Date(chat.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (!groups[key]) {
            const group: ChatGroup = {
                dateKey: key,
                date: new Date(d),
                chats: [],
            };
            groups[key] = group;
            ordered.push(group);
        }
        groups[key].chats.push(chat);
    }
    return ordered;
});

function formatDateLabel(d: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const toYMD = (x: Date) =>
        `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;

    const key = toYMD(d);
    if (key === toYMD(today)) {
        return t("date.today");
    }
    if (key === toYMD(yesterday)) {
        return t("date.yesterday");
    }
    return d.toLocaleDateString();
}

function showMore(): void {
    visibleCount.value += 10;
}

const hasMore = computed<boolean>(
    () => allChats.value.length > visibleCount.value,
);

function isActiveChat(chatId: string): boolean {
    return route.name === "chat-id" && String(route.params.id) === chatId;
}

// State for mobile slideover
const open = ref(false);

/**
 * Delete a chat and all related data in a single transaction.
 */
async function deleteChat(chatId: string): Promise<void> {
    await db.transaction(
        "rw",
        db.chats,
        db.messages,
        db.statusParts,
        db.documents,
        async () => {
            const messagesInChat = await db.messages
                .where("chatId")
                .equals(chatId)
                .toArray();
            const messageIds = messagesInChat.map((m) => m.id);

            if (messageIds.length > 0) {
                await db.statusParts
                    .where("messageId")
                    .anyOf(messageIds)
                    .delete();
                await db.documents
                    .where("messageId")
                    .anyOf(messageIds)
                    .delete();
            }

            await db.messages.where("chatId").equals(chatId).delete();
            await db.chats.delete(chatId);
        },
    );
}

async function onDelete(chatId: string): Promise<void> {
    await deleteChat(chatId);
}
</script>

<template>
    <USlideover v-model:open="open" side="left" :title="t('chat.history')">
        <UButton color="neutral" variant="ghost" icon="i-lucide-history" :label='t("chat.history")' @click="open = true"
            type="button" />
        <template #body>
            <div class="flex flex-col gap-4">
                <template v-for="group in groupedChats" :key="group.dateKey">
                    <div class="text-xs uppercase text-muted-foreground">
                        {{ formatDateLabel(group.date) }}
                    </div>
                    <ul class="flex flex-col">
                        <li v-for="chat in group.chats" :key="chat.id" class="flex items-center justify-between gap-2">
                            <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-trash-2"
                                :aria-label="t('common.delete')" type="button"
                                @click.stop.prevent="onDelete(chat.id)" />
                            <NuxtLink :to="`/chat/${chat.id}`"
                                class="flex-1 px-2 py-2 rounded-md hover:bg-muted text-sm transition-colors"
                                :aria-current="isActiveChat(chat.id) ? 'page' : undefined" @click="open = false">
                                <span class="line-clamp-2">{{ chat.title }}</span>
                            </NuxtLink>
                        </li>
                    </ul>
                </template>

                <div v-if="hasMore" class="pt-2">
                    <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-chevrons-down"
                        :label="t('chat.showOlder')" @click="showMore" type="button" />
                </div>
            </div>
        </template>
    </USlideover>
</template>