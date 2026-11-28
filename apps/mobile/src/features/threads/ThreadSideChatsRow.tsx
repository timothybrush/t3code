import type { EnvironmentId, ThreadId } from "@t3tools/contracts";
import { T, useGT } from "gt-react-native";
import { Platform, Pressable, ScrollView, View } from "react-native";

import { AppText as Text } from "../../components/ui/AppText";
import { SymbolView } from "../../components/ui/AppSymbol";
import { Menu } from "../../components/ui/Menu";
import { cn } from "../../lib/cn";
import { useSideChats } from "../../state/entities";
import { useThreadListActions } from "../home/useThreadListActions";
import { useOpenLinkedThread } from "./useOpenLinkedThread";

/**
 * The thread's side chats. Each opens as a normal thread, so its approvals and questions can be
 * answered from the phone; a long press deletes one.
 */
export function ThreadSideChatsRow(props: {
  readonly environmentId: EnvironmentId;
  readonly threadId: ThreadId;
}) {
  const sideChats = useSideChats({ environmentId: props.environmentId, threadId: props.threadId });
  const openLinkedThread = useOpenLinkedThread();
  const { confirmDeleteThread } = useThreadListActions();
  const gt = useGT();
  if (sideChats.length === 0) return null;
  return (
    <View
      className={cn(
        "flex-row items-center gap-2 py-2 pl-4",
        Platform.OS === "android" ? "bg-thread-canvas" : "bg-screen",
      )}
    >
      <SymbolView
        name="bubble.left.and.bubble.right"
        size={12}
        tintColorClassName="accent-foreground-muted"
      />
      <Text className="text-xs text-foreground-muted">
        <T>Side chats</T>
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
        <View className="flex-row gap-1 pr-4">
          {sideChats.map((sideChat) => {
            const needs =
              sideChat.hasPendingApprovals || sideChat.pendingSubagentRequest === "approval"
                ? "approval"
                : sideChat.hasPendingUserInput || sideChat.pendingSubagentRequest
                  ? "input"
                  : null;
            return (
              <Menu
                key={sideChat.id}
                shouldOpenOnLongPress
                title={sideChat.title}
                actions={[
                  {
                    id: "delete",
                    title: gt("Delete side chat"),
                    image: "trash",
                    attributes: { destructive: true },
                  },
                ]}
                onPressAction={({ nativeEvent }) => {
                  if (nativeEvent.event === "delete") confirmDeleteThread(sideChat);
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    needs === null
                      ? gt("Open side chat {title}", { title: sideChat.title })
                      : needs === "approval"
                        ? gt("Open side chat {title}, needs approval", { title: sideChat.title })
                        : gt("Open side chat {title}, needs input", { title: sideChat.title })
                  }
                  className="max-w-48 flex-row items-center gap-1.5 rounded-full bg-subtle px-2.5 py-1"
                  accessibilityActions={[{ name: "delete", label: gt("Delete side chat") }]}
                  onAccessibilityAction={(event) => {
                    if (event.nativeEvent.actionName === "delete") confirmDeleteThread(sideChat);
                  }}
                  onPress={() =>
                    openLinkedThread({ environmentId: props.environmentId, threadId: sideChat.id })
                  }
                >
                  {needs === null ? null : (
                    <View
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        needs === "approval"
                          ? "bg-warning-foreground"
                          : "bg-adaptive-indigo-600-300",
                      )}
                    />
                  )}
                  <Text className="shrink text-xs text-foreground" numberOfLines={1}>
                    {sideChat.title}
                  </Text>
                </Pressable>
              </Menu>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
