import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../services/mockApi";
import { colors, radius, shadows, spacing, typography } from "../../../theme/tokens";
import { ChatMessage } from "../../../types/domain";

const quickReplies = [
  { label: "🎁 Tư vấn quà tặng", prompt: "gift" },
  { label: "📦 Theo dõi đơn hàng", prompt: "order" },
  { label: "🚚 Thông tin giao hàng", prompt: "shipping" },
  { label: "🎟️ Voucher & ưu đãi", prompt: "voucher" },
];

export function ChatbotScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const initialChatQuery = useQuery({
    queryKey: ["chat-init"],
    queryFn: api.support.initialChat,
  });

  useEffect(() => {
    if (initialChatQuery.data && messages.length === 0) {
      setMessages(initialChatQuery.data);
    }
  }, [initialChatQuery.data, messages.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [messages]);

  const mutation = useMutation({
    mutationFn: api.support.askBot,
    onSuccess: (reply) => {
      const time = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((current) => [
        ...current,
        { id: `b-${Date.now()}`, role: "bot", text: reply, time },
      ]);
    },
    onError: () => {
      const time = new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((current) => [
        ...current,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: "Xin lỗi, mình đang gặp trục trặc nhỏ. Bạn thử lại sau nhé.",
          time,
        },
      ]);
    },
  });

  const sendMessage = (displayText: string, prompt = displayText) => {
    const clean = displayText.trim();
    if (!clean || mutation.isPending) return;

    const time = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", text: clean, time },
    ]);
    setInput("");
    mutation.mutate(prompt);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBack}>
            <MaterialIcons color={colors.white} name="arrow-back-ios-new" size={18} />
          </Pressable>
          <View style={styles.botAvatar}>
            <MaterialIcons color={colors.white} name="smart-toy" size={20} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>GiftBox Trợ Lý</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.role === "user" ? styles.messageRowRight : styles.messageRowLeft,
            ]}
          >
            {message.role === "bot" ? (
              <View style={styles.botBubbleIcon}>
                <MaterialIcons color={colors.white} name="smart-toy" size={14} />
              </View>
            ) : null}
            <View
              style={[
                styles.messageBlock,
                message.role === "user" ? styles.messageBlockRight : styles.messageBlockLeft,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  message.role === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    message.role === "user" && styles.userBubbleText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
              <Text style={styles.messageTime}>{message.time}</Text>
            </View>
          </View>
        ))}

        {mutation.isPending ? (
          <View style={styles.messageRow}>
            <View style={styles.botBubbleIcon}>
              <MaterialIcons color={colors.white} name="smart-toy" size={14} />
            </View>
            <View style={styles.typingBubble}>
              {[0, 1, 2].map((item) => (
                <View key={item} style={styles.typingDot} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickReplies}
        style={styles.quickRepliesShell}
      >
        {quickReplies.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => sendMessage(item.label, item.prompt)}
            style={styles.quickReplyChip}
          >
            <Text style={styles.quickReplyText}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.inputShell}>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            style={styles.input}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            style={[
              styles.sendButton,
              !input.trim() && styles.sendButtonDisabled,
            ]}
          >
            <MaterialIcons color={colors.white} name="send" size={14} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  statusText: {
    fontSize: typography.tiny,
    color: "rgba(255,255,255,0.78)",
  },
  messages: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: spacing.base,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  botBubbleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBlock: {
    maxWidth: "76%",
  },
  messageBlockLeft: {
    alignItems: "flex-start",
  },
  messageBlockRight: {
    alignItems: "flex-end",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadows.card,
  },
  botBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    fontSize: typography.body,
    lineHeight: 20,
    color: colors.text,
  },
  userBubbleText: {
    color: colors.white,
  },
  messageTime: {
    marginTop: 4,
    fontSize: 10,
    color: colors.textMuted,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  quickRepliesShell: {
    maxHeight: 46,
  },
  quickReplies: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  quickReplyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  quickReplyText: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.primary,
  },
  inputShell: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  inputRow: {
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.base,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderDark,
  },
});
